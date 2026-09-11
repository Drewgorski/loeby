import { useLiveQuery } from 'dexie-react-hooks';
import { readState, setPhase, toggleGate } from '../db/db';
import { PHASES, dayCount } from '../program/content';
import { IconCheck } from '../components/icons';
import Calendar from '../components/Calendar';
import Tomorrow from '../components/Tomorrow';
import PostureShots from '../components/PostureShots';
import Backup from '../components/Backup';
import CloudSync from '../components/CloudSync';

export default function Progress() {
  const state = useLiveQuery(() => readState(), []);

  if (!state) return null;

  const phase = PHASES[state.phase] ?? PHASES[0];
  const passed = (i: number) => state.gatesPassed.includes(`${phase.id}:${i}`);
  const allPassed = phase.gate.every((_, i) => passed(i));
  const isLast = state.phase >= PHASES.length - 1;

  return (
    <div className="page">
      <div className="page-head">
        <h1>Progress</h1>
        <div className="page-sub">You move forward by passing a test, not by waiting a certain number of weeks.</div>
      </div>

      <div className="card">
        <div className="eyebrow">To unlock Phase {Math.min(phase.id + 1, PHASES.length - 1)}</div>
        {phase.gate.map((g, i) => (
          <button
            key={g}
            type="button"
            className={`gate${passed(i) ? ' on' : ''}`}
            onClick={() => toggleGate(`${phase.id}:${i}`)}
            style={{ width: '100%', background: 'none', border: 0, borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}
          >
            <span className="gate-box">{passed(i) && <IconCheck />}</span>
            <span className="gate-label">{g}</span>
          </button>
        ))}

        {!isLast && (
          <button
            type="button"
            className="btn primary block"
            style={{ marginTop: 16 }}
            disabled={!allPassed}
            onClick={() => setPhase(state.phase + 1)}
          >
            {allPassed ? `Move to Phase ${phase.id + 1} — ${PHASES[phase.id + 1].name}` : 'Tick every box to advance'}
          </button>
        )}
        {isLast && allPassed && (
          <div className="block-note" style={{ marginBottom: 0, marginTop: 16 }}>
            That's the whole program. Keep sprinting — the exposure is what keeps it durable.
          </div>
        )}
      </div>

      <div className="card">
        <div className="eyebrow">The phases</div>
        {PHASES.map((p) => (
          <div
            key={p.id}
            className={`phase-row${p.id < state.phase ? ' done' : ''}${p.id === state.phase ? ' current' : ''}`}
          >
            <span className="phase-dot">{p.id < state.phase ? <IconCheck /> : p.id}</span>
            <span>
              <div className="phase-row-name">
                {p.name}
                {p.id === state.phase && (
                  <span className="faint" style={{ fontWeight: 400 }}>
                    {' '}· day {state.day ?? 1} of {dayCount(p.id)}
                  </span>
                )}
              </div>
              <div className="phase-row-sub">{p.goal}</div>
            </span>
          </div>
        ))}
      </div>

      <div className="track-divider">
        <span>History</span>
      </div>
      <Calendar />
      <Tomorrow />

      <div className="track-divider">
        <span>Posture</span>
      </div>
      <PostureShots />

      <div className="track-divider">
        <span>Keeping it safe</span>
      </div>
      <CloudSync />
      <Backup />
    </div>
  );
}
