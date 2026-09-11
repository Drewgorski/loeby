import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, exportAll, importAll } from '../db/db';

const STAMP = new Intl.DateTimeFormat('en-CA'); // YYYY-MM-DD, for a sortable filename

export default function Backup() {
  const photoCount = useLiveQuery(() => db.photos.count(), []);
  const dayCount = useLiveQuery(() => db.journal.count(), []);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [msg, setMsg] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);

  async function onExport() {
    setBusy('export');
    setMsg(undefined);
    try {
      const data = await exportAll();
      const json = JSON.stringify(data);
      const file = new File([json], `loeby-backup-${STAMP.format(new Date())}.json`, {
        type: 'application/json',
      });

      // The share sheet is the reliable route on iOS — it offers Save to Files,
      // AirDrop and Messages. A plain <a download> is unreliable inside an
      // installed web app, so it's only the fallback.
      const canShare =
        typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
      if (canShare) {
        await navigator.share({ files: [file], title: 'Loeby backup' });
        setMsg('Saved. Keep it somewhere that is not just this phone.');
      } else {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
        setMsg('Downloaded. Keep it somewhere that is not just this phone.');
      }
    } catch (e) {
      // A cancelled share sheet throws AbortError — not worth alarming her over.
      if ((e as Error)?.name !== 'AbortError') {
        setMsg(`Export failed: ${(e as Error).message}`);
      }
    } finally {
      setBusy(null);
    }
  }

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy('import');
    setMsg(undefined);
    try {
      const { restored } = await importAll(JSON.parse(await file.text()));
      setMsg(`Restored ${restored} entries. Reloading…`);
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setMsg(`Could not restore: ${(err as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="card">
      <div className="eyebrow">Backup</div>
      <p className="day-status-text" style={{ marginBottom: 14 }}>
        Everything lives on this phone and nowhere else — {dayCount ?? 0} logged day
        {dayCount === 1 ? '' : 's'} and {photoCount ?? 0} photo{photoCount === 1 ? '' : 's'}. Clearing
        Safari's website data would erase all of it. Save a copy somewhere else every few weeks.
      </p>

      <button type="button" className="btn primary block" disabled={busy !== null} onClick={onExport}>
        {busy === 'export' ? 'Preparing…' : 'Save a backup file'}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        onChange={onImport}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        className="btn block"
        style={{ marginTop: 10 }}
        disabled={busy !== null}
        onClick={() => fileRef.current?.click()}
      >
        {busy === 'import' ? 'Restoring…' : 'Restore from a backup file'}
      </button>

      {msg && (
        <p className="day-status-text" style={{ marginTop: 12 }}>
          {msg}
        </p>
      )}
    </div>
  );
}
