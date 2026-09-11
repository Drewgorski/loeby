import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { readState } from '../db/db';
import { FOUNDATION, PHASES, dayFor } from '../program/content';
import MovementItem from '../components/MovementItem';

/**
 * Every exercise in the program, by phase. Read-only reference — ticking off
 * belongs to Today, which prescribes the actual day.
 */
export default function Library() {
  const state = useLiveQuery(() => readState(), []);
  const [selected, setSelected] = useState<number | null>(null);

  if (!state) return null;

  const currentPhase = state.phase;
  const phaseId = selected ?? currentPhase;
  const phase = PHASES[phaseId] ?? PHASES[0];

  // Only meaningful for the phase she's actually in.
  const currentDay = dayFor(currentPhase, state.day ?? 1);
  const todayIds =
    phaseId === currentPhase
      ? new Set([...currentDay.required, ...currentDay.foundation])
      : new Set(currentDay.foundation);

  // Optional blocks are Today's business, not the Library's — this is the
  // reference for the actual program, so the count excludes them too.
  const blocks = phase.blocks.filter((b) => !b.optional && b.movements.length > 0);
  const total = blocks.reduce((n, b) => n + b.movements.length, 0);

  return (
    <div className="page">
      <div className="page-head">
        <h1>Library</h1>
        <div className="page-sub">
          Every exercise in the program, with the cue and the reason. Today only ever shows you the ones
          you need that day — this is where the rest live.
        </div>
      </div>

      <div className="phase-tabs" role="tablist" aria-label="Phase">
        {PHASES.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={p.id === phaseId}
            className={`phase-tab${p.id === phaseId ? ' on' : ''}`}
            onClick={() => setSelected(p.id)}
          >
            {p.id}
            {p.id === currentPhase && <span className="phase-tab-dot" aria-label="current phase" />}
          </button>
        ))}
      </div>

      <div className="card phase-hero">
        <div className="phase-num">
          Phase {phase.id}
          {phase.id === currentPhase ? ' · where you are now' : phase.id < currentPhase ? ' · done' : ' · ahead'}
        </div>
        <h2 className="phase-name">{phase.name}</h2>
        <div className="phase-headline">{phase.goal}</div>
      </div>

      {phase.avoid && phase.avoid.length > 0 && (
        <div className="card avoid">
          <div className="eyebrow">Not in this phase</div>
          <ul>
            {phase.avoid.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {blocks.map((block) => (
        <div className="card" key={block.title}>
          <div className="block-head">
            <div className="block-title">{block.title}</div>
          </div>
          {block.note && <div className="block-note">{block.note}</div>}
          {block.movements.map((m) => (
            <MovementItem key={m.id} m={m} tag={todayIds.has(m.id) ? 'Today' : undefined} />
          ))}
        </div>
      ))}

      <div className="track-divider">
        <span>Foundation</span>
      </div>
      <p className="track-intro">
        Not a phase. This runs underneath all five of them, every day, and it is what actually changes your
        posture and your gait. The order is deliberate: ribcage and pelvis first, then hips, then shoulders.
      </p>

      {FOUNDATION.map((block) => (
        <div className="card" key={block.title}>
          <div className="block-head">
            <div className="block-title">{block.title}</div>
          </div>
          {block.note && <div className="block-note">{block.note}</div>}
          {block.movements.map((m) => (
            <MovementItem key={m.id} m={m} tag={todayIds.has(m.id) ? 'Today' : undefined} />
          ))}
        </div>
      ))}

      <div className="card">
        <div className="eyebrow">Unlocks the next phase</div>
        {phase.gate.map((g) => (
          <div className="gate" key={g} style={{ cursor: 'default' }}>
            <span className="gate-box" aria-hidden />
            <span className="gate-label">{g}</span>
          </div>
        ))}
        <p className="day-status-text" style={{ marginTop: 14 }}>
          {total} exercises in this phase. Tick the checkpoints off on Progress when they're true.
        </p>
      </div>
    </div>
  );
}
