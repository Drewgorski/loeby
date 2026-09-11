import {
  collection, deleteDoc, doc, getDocs, query, setDoc, where,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { firestore, storage } from '../firebase';
import {
  SYNCED_TABLES, db, withRemoteApply,
  type OutboxEntry, type PosturePhoto, type SyncMeta,
} from '../db/db';

/**
 * Backup-shaped sync, not collaborative sync.
 *
 * Only one person uses this on one phone, so there are no realtime listeners
 * and no conflict resolution beyond last-write-wins. What it guarantees is the
 * thing that actually matters: nothing is lost when the phone is wiped, and a
 * new device can pull everything back.
 *
 * Local rows go up via the outbox (see db.ts), so a sync only sends what
 * changed. Cloud rows come down by `updatedAt` high-water mark.
 *
 * Loeby lives under `users/{uid}/loeby_*`, inside the same per-user scope the
 * existing Firestore rules already lock to the signed-in owner.
 */

const colPath = (uid: string, table: string) => `users/${uid}/loeby_${table}`;
const photoPath = (uid: string, id: string) => `users/${uid}/loeby-photos/${id}.jpg`;

export type SyncState =
  | { status: 'idle'; lastSyncedAt?: number; pending: number }
  | { status: 'syncing' }
  | { status: 'error'; message: string };

let running = false;

async function meta(): Promise<SyncMeta> {
  return (await db.syncMeta.get('sync')) ?? { id: 'sync', lastPullAt: 0 };
}

/** Blobs cannot go in Firestore, so photo bytes go to Storage and the doc keeps the URL. */
async function pushPhoto(uid: string, id: string): Promise<Record<string, unknown> | null> {
  const photo = await db.photos.get(id);
  if (!photo) return null;
  let url = photo.url;
  if (photo.blob && !url) {
    const ref = storageRef(storage, photoPath(uid, id));
    await uploadBytes(ref, photo.blob, { contentType: 'image/jpeg' });
    url = await getDownloadURL(ref);
    // Record the URL locally too, so a later wipe can still find the bytes.
    await withRemoteApply(() => db.photos.update(id, { url }));
  }
  const { blob: _blob, ...rest } = photo;
  return { ...rest, url: url ?? null };
}

async function drainOutbox(uid: string): Promise<void> {
  const entries: OutboxEntry[] = await db.outbox.toArray();
  for (const entry of entries) {
    const ref = doc(firestore, colPath(uid, entry.table), entry.id);
    try {
      if (entry.op === 'delete') {
        await deleteDoc(ref);
        if (entry.table === 'photos') {
          await deleteObject(storageRef(storage, photoPath(uid, entry.id))).catch(() => {});
        }
      } else if (entry.table === 'photos') {
        const data = await pushPhoto(uid, entry.id);
        if (data) await setDoc(ref, { ...data, updatedAt: Date.now() });
      } else {
        const row = await db.table(entry.table).get(
          entry.table === 'checkins' || entry.table === 'journal' ? Number(entry.id) : entry.id,
        );
        if (row) await setDoc(ref, { ...row, updatedAt: Date.now() });
      }
      await db.outbox.delete(entry.key);
    } catch (e) {
      // Leave it queued — the next sync retries. One bad row must not block the rest.
      console.warn('[sync] push failed', entry.key, e);
    }
  }
}

async function pull(uid: string): Promise<void> {
  const m = await meta();
  let newest = m.lastPullAt;

  for (const table of SYNCED_TABLES) {
    const snap = await getDocs(
      query(collection(firestore, colPath(uid, table)), where('updatedAt', '>', m.lastPullAt)),
    );
    if (snap.empty) continue;

    await withRemoteApply(async () => {
      for (const d of snap.docs) {
        const { updatedAt, ...row } = d.data() as Record<string, unknown> & { updatedAt: number };
        if (updatedAt > newest) newest = updatedAt;

        if (table === 'photos') {
          // Keep any local blob; the cloud copy only carries metadata and a URL.
          const existing = await db.photos.get(d.id);
          await db.photos.put({
            ...(row as unknown as PosturePhoto),
            blob: existing?.blob,
          });
        } else {
          await db.table(table).put(row);
        }
      }
    });
  }

  await db.syncMeta.put({ id: 'sync', lastPullAt: newest, lastSyncedAt: Date.now() });
}

/** Push what changed, then pull what's new. Safe to call often; overlaps are ignored. */
export async function syncNow(uid: string): Promise<void> {
  if (running) return;
  running = true;
  try {
    await drainOutbox(uid);
    await pull(uid);
  } finally {
    running = false;
  }
}

export async function pendingCount(): Promise<number> {
  return db.outbox.count();
}

/**
 * Clear local sync bookkeeping on sign-out so the next account starts clean.
 * Her data itself is left alone — signing out is not a delete.
 */
export async function resetSyncState(): Promise<void> {
  await db.syncMeta.delete('sync');
}
