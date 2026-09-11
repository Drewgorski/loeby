import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { authErrorMessage, signIn, signOut, signUp, useAuthUser } from '../lib/auth';
import { resetSyncState, syncNow } from '../lib/sync';

const WHEN = new Intl.DateTimeFormat(undefined, {
  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
});

export default function CloudSync() {
  const user = useAuthUser();
  const pending = useLiveQuery(() => db.outbox.count(), []);
  const meta = useLiveQuery(() => db.syncMeta.get('sync'), []);

  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [syncing, setSyncing] = useState(false);

  // Sync on sign-in, and again whenever the app comes back to the foreground —
  // which on a phone is the moment that actually matters.
  useEffect(() => {
    if (!user) return;
    const run = () => {
      setSyncing(true);
      syncNow(user.uid)
        .catch((e) => setError(`Sync failed: ${(e as Error).message}`))
        .finally(() => setSyncing(false));
    };
    run();
    const onVisible = () => document.visibilityState === 'visible' && run();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [user?.uid]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      if (mode === 'up') await signUp(email, password);
      else await signIn(email, password);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (user === undefined) return null;

  if (!user) {
    return (
      <div className="card">
        <div className="eyebrow">Back up to the cloud</div>
        <p className="day-status-text" style={{ marginBottom: 14 }}>
          Sign in and everything — days, check-ins and photos — is saved off this phone automatically. It
          comes back if the phone is wiped, lost or replaced.
        </p>
        <form onSubmit={submit}>
          <input
            className="field"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="field"
            type="password"
            autoComplete={mode === 'up' ? 'new-password' : 'current-password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn primary block" type="submit" disabled={busy}>
            {busy ? 'One moment…' : mode === 'up' ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <button
          type="button"
          className="btn ghost block"
          style={{ marginTop: 10 }}
          onClick={() => {
            setMode(mode === 'up' ? 'in' : 'up');
            setError(undefined);
          }}
        >
          {mode === 'up' ? 'I already have an account' : 'Create an account instead'}
        </button>
        {error && (
          <p className="day-status-text" style={{ marginTop: 12, color: 'var(--warn)' }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="eyebrow">Backed up</div>
      <p className="day-status-text">
        Signed in as {user.email}.{' '}
        {syncing
          ? 'Saving…'
          : pending
            ? `${pending} change${pending === 1 ? '' : 's'} waiting to upload.`
            : meta?.lastSyncedAt
              ? `Everything saved — last checked ${WHEN.format(new Date(meta.lastSyncedAt))}.`
              : 'Everything saved.'}
      </p>
      {error && (
        <p className="day-status-text" style={{ marginTop: 10, color: 'var(--warn)' }}>
          {error}
        </p>
      )}
      <button
        type="button"
        className="btn ghost block"
        style={{ marginTop: 14 }}
        disabled={syncing}
        onClick={() => {
          setSyncing(true);
          syncNow(user.uid)
            .catch((e) => setError(`Sync failed: ${(e as Error).message}`))
            .finally(() => setSyncing(false));
        }}
      >
        Sync now
      </button>
      <button
        type="button"
        className="btn ghost block"
        style={{ marginTop: 10 }}
        onClick={async () => {
          await signOut();
          await resetSyncState();
        }}
      >
        Sign out
      </button>
    </div>
  );
}
