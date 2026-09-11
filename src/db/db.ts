import Dexie, { type EntityTable } from 'dexie';

/** One row per day she checks in. Drives the phase gates. */
export interface CheckIn {
  /** day-start epoch ms — one check-in per day */
  date: number;
  /** 0–10. The rule: under 5 during work, and no worse next morning. */
  pain: number;
  didSession: boolean;
  walkedNoLimp: boolean;
  note?: string;
}

/** Single-row app state. */
export interface ProgressState {
  id: 'state';
  phase: number;
  /** 1-based day within the current phase. Optional for rows written before v3. */
  day?: number;
  startedAt: number;
  /** ids of gate criteria the user has ticked, per phase: `${phase}:${index}` */
  gatesPassed: string[];
}

/**
 * Which phase and program day were active on a given calendar date. The tick
 * rows say WHAT she did; without this there's no way to know which day of the
 * program that was, since the day counter only ever holds the present.
 */
export interface JournalEntry {
  /** dayStart */
  date: number;
  phase: number;
  day: number;
}

export type Pose = 'front' | 'left' | 'right' | 'back';
export const POSES: Pose[] = ['front', 'left', 'right', 'back'];
export const POSE_LABEL: Record<Pose, string> = {
  front: 'Front',
  left: 'Left',
  right: 'Right',
  back: 'Back',
};

/** A posture photo. One per pose per day — retaking replaces that day's shot. */
export interface PosturePhoto {
  /** `${dayStart}:${pose}` */
  id: string;
  date: number;
  pose: Pose;
  blob: Blob;
  /** Phase and day it was taken on, so the timeline can label it. */
  phase: number;
  day: number;
}

/** One record per day of a phase that was finished. */
export interface DayLog {
  /** `${phase}:${day}` */
  id: string;
  phase: number;
  day: number;
  /** dayStart on which it was completed */
  completedOn: number;
}

/** One row per exercise ticked off, per day. */
export interface MovementDone {
  /** `${dayStart}:${movementId}` — deterministic, so a re-tick overwrites. */
  id: string;
  date: number;
  movementId: string;
  at: number;
}

const db = new Dexie('LoebyDB') as Dexie & {
  checkins: EntityTable<CheckIn, 'date'>;
  progress: EntityTable<ProgressState, 'id'>;
  done: EntityTable<MovementDone, 'id'>;
  dayLogs: EntityTable<DayLog, 'id'>;
  journal: EntityTable<JournalEntry, 'date'>;
  photos: EntityTable<PosturePhoto, 'id'>;
};

db.version(1).stores({
  checkins: 'date',
  progress: 'id',
});

// v2 adds per-exercise daily ticks. Additive only, so Dexie upgrades in place
// and existing check-ins and phase progress are untouched.
db.version(2).stores({
  checkins: 'date',
  progress: 'id',
  done: 'id, date',
});

// v3 adds day-by-day progression within a phase.
db.version(3)
  .stores({
    checkins: 'date',
    progress: 'id',
    done: 'id, date',
    dayLogs: 'id, phase',
  })
  .upgrade((tx) => tx.table('progress').toCollection().modify((s: ProgressState) => {
    if (s.day == null) s.day = 1;
  }));

// v4 records which program day each calendar date was, for the history view.
db.version(4).stores({
  checkins: 'date',
  progress: 'id',
  done: 'id, date',
  dayLogs: 'id, phase',
  journal: 'date',
});

// v5 adds posture photos.
db.version(5).stores({
  checkins: 'date',
  progress: 'id',
  done: 'id, date',
  dayLogs: 'id, phase',
  journal: 'date',
  photos: 'id, date, pose',
});

// NOTE: the 'side' pose became 'left' + 'right' during development. That was a
// change of stored VALUES, not of schema, so it needs no version bump — and no
// build ever shipped with 'side' photos in it. Deliberately no migration: an
// untested upgrade that touches photos can only lose them.

export { db };

export function startOfDay(ts = Date.now()): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export const DEFAULT_STATE: ProgressState = { id: 'state', phase: 0, day: 1, startedAt: 0, gatesPassed: [] };

/**
 * Read-only. Safe inside useLiveQuery — a liveQuery may not open a readwrite
 * transaction, so seeding happens separately in ensureState().
 */
export async function readState(): Promise<ProgressState> {
  return (await db.progress.get('state')) ?? DEFAULT_STATE;
}

/** Seeds the single state row. Called once at startup, never from a liveQuery. */
let seeding: Promise<void> | null = null;
export function ensureState(): Promise<void> {
  if (!seeding) {
    seeding = db.progress.get('state').then(async (existing) => {
      if (!existing) {
        await db.progress.put({ ...DEFAULT_STATE, startedAt: Date.now() });
      }
    });
  }
  return seeding;
}

export async function getState(): Promise<ProgressState> {
  await ensureState();
  return (await db.progress.get('state')) ?? DEFAULT_STATE;
}

/**
 * Read-modify-write on the state row, inside a transaction so that rapid taps
 * serialize. Without it, several taps in a row all read the same snapshot and
 * only the last one survives.
 */
function mutateState(fn: (s: ProgressState) => ProgressState): Promise<void> {
  return db.transaction('rw', db.progress, async () => {
    const current = (await db.progress.get('state')) ?? { ...DEFAULT_STATE, startedAt: Date.now() };
    await db.progress.put(fn(current));
  });
}

/** Advancing a phase always restarts the day ramp at day 1. */
export function setPhase(phase: number): Promise<void> {
  return mutateState((s) => ({ ...s, phase, day: 1 }));
}

/** Marks the current day finished. Idempotent — re-completing keeps the first date. */
export function completeDay(phase: number, day: number, on: number): Promise<void> {
  const id = `${phase}:${day}`;
  return db.transaction('rw', db.dayLogs, async () => {
    if (!(await db.dayLogs.get(id))) {
      await db.dayLogs.put({ id, phase, day, completedOn: on });
    }
  });
}

/**
 * Withdraw a completion, but ONLY one recorded today. A past day's completion
 * is history and must stand: tomorrow morning the tick list is empty again, and
 * deleting yesterday's log here would strand the ramp on day 1 forever.
 */
export function uncompleteDay(phase: number, day: number, on: number): Promise<void> {
  const id = `${phase}:${day}`;
  return db.transaction('rw', db.dayLogs, async () => {
    const log = await db.dayLogs.get(id);
    if (log && log.completedOn === on) await db.dayLogs.delete(id);
  });
}

/**
 * Advance to the next day if, and only if, the current day was completed on an
 * EARLIER day than today. The gap is the point: it's the morning-after check
 * from the one rule, so a day can never be cleared twice in one sitting.
 * Clamped at the phase's last day, which repeats until the gates pass.
 */
export async function reconcileDay(lastDayOfPhase: number): Promise<void> {
  const s = await getState();
  const day = s.day ?? 1;
  if (day >= lastDayOfPhase) return;
  const log = await db.dayLogs.get(`${s.phase}:${day}`);
  if (!log) return;
  if (startOfDay() > log.completedOn) {
    await mutateState((cur) => ({ ...cur, day: (cur.day ?? 1) + 1 }));
  }
}

/**
 * Step back a day after an overnight flare.
 *
 * Clearing both day logs is the point, not housekeeping: if it flared, that day
 * was not actually cleared, so it has to be earned again. Leave the old log in
 * place and reconcileDay would simply push her straight back up tomorrow.
 */
export function repeatPreviousDay(): Promise<void> {
  return db.transaction('rw', db.progress, db.dayLogs, async () => {
    const s = (await db.progress.get('state')) ?? { ...DEFAULT_STATE, startedAt: Date.now() };
    const cur = s.day ?? 1;
    const prev = Math.max(1, cur - 1);
    await db.dayLogs.delete(`${s.phase}:${cur}`);
    await db.dayLogs.delete(`${s.phase}:${prev}`);
    await db.progress.put({ ...s, day: prev });
  });
}

/** Ticks (or un-ticks) one exercise for one day. */
export function toggleMovementDone(date: number, movementId: string): Promise<void> {
  const id = `${date}:${movementId}`;
  return db.transaction('rw', db.done, async () => {
    const existing = await db.done.get(id);
    if (existing) await db.done.delete(id);
    else await db.done.put({ id, date, movementId, at: Date.now() });
  });
}

/** The movement ids ticked off on a given day. */
/**
 * Shrink a camera photo before it goes into IndexedDB. Phone shots are 3–5MB
 * each; at three poses a week that fills the origin's quota within months and
 * writes start failing. 1400px is far more than enough to see a pelvis tilt.
 */
export async function downscale(file: File, max = 1400, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality));
  return blob ?? file;
}

/** Save one pose for one day, replacing any earlier shot of that pose that day. */
export async function savePhoto(
  date: number,
  pose: Pose,
  file: File,
  phase: number,
  day: number,
): Promise<void> {
  const blob = await downscale(file);
  await db.photos.put({ id: `${date}:${pose}`, date, pose, blob, phase, day });
}

export function deletePhoto(id: string): Promise<void> {
  return db.photos.delete(id);
}

/** Stamp a date with the phase/day active on it, so history reads back correctly. */
export function recordJournal(date: number, phase: number, day: number): Promise<unknown> {
  return db.journal.put({ date, phase, day });
}

export async function doneOn(date: number): Promise<string[]> {
  const rows = await db.done.where('date').equals(date).toArray();
  return rows.map((r) => r.movementId);
}

export function toggleGate(key: string): Promise<void> {
  return mutateState((s) => ({
    ...s,
    gatesPassed: s.gatesPassed.includes(key)
      ? s.gatesPassed.filter((g) => g !== key)
      : [...s.gatesPassed, key],
  }));
}
