import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  completeDay, db, doneOn, readState, reconcileDay, recordJournal, repeatPreviousDay, startOfDay,
  toggleMovementDone, uncompleteDay, type CheckIn,
} from '../db/db';
import {
  FOUNDATION, FOUNDATION_MOVEMENTS, PHASES, RED_FLAGS, dayCount, dayFor, type Block,
} from '../program/content';
import { IconCheck } from '../components/icons';
import MovementItem from '../components/MovementItem';

const DATE_FMT = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

export default function Today() {
  const state = useLiveQuery(() => readState(), []);
  const today = startOfDay();
  const checkin = useLiveQuery(() => db.checkins.get(today), [today]);
  const doneIds = useLiveQuery(() => doneOn(today), [today]);

  const phaseId = state?.phase ?? 0;
  const dayN = state?.day ?? 1;

  // Roll onto the next day when yesterday's was completed and a new day started.
  useEffect(() => {
    if (!state) return;
    reconcileDay(dayCount(phaseId)).catch((e) => console.error('Day reconcile failed:', e));
  }, [state?.phase, state?.day, today]);

  // Stamp today with the program day, so the calendar can show what each past
  // date actually was. Runs after reconcile so it records the settled day.
  useEffect(() => {
    if (!state) return;
    recordJournal(today, phaseId, dayN).catch((e) => console.error('Journal write failed:', e));
  }, [today, phaseId, dayN, state]);

  // Keep the day log in step with the ticks, in both directions — unticking an
  // exercise has to withdraw the completion, or a half-done day would still
  // advance tomorrow.
  useEffect(() => {
    if (!state || !doneIds) return;
    const req = dayFor(phaseId, dayN).required;
    const complete = req.every((id) => doneIds.includes(id));
    const fn = complete ? completeDay(phaseId, dayN, today) : uncompleteDay(phaseId, dayN, today);
    fn.catch((e) => console.error('Day log update failed:', e));
  }, [doneIds, phaseId, dayN, today]);

  if (!state || !doneIds) return null;
  const done = new Set(doneIds);

  const phase = PHASES[state.phase] ?? PHASES[0];
  const dayNum = state.day ?? 1;
  const day = dayFor(phase.id, dayNum);
  const isSteady = dayNum >= dayCount(phase.id);

  // Today's prescription, grouped by the phase's blocks. Optional blocks are
  // always available; required ones are filtered down to just today's work.
  const required = new Set(day.required);
  const todayBlocks = phase.blocks
    .map((b) => ({ ...b, movements: b.optional ? b.movements : b.movements.filter((m) => required.has(m.id)) }))
    .filter((b) => b.movements.length > 0);

  // Optional work sits at the very bottom, below Foundation — everything that
  // actually counts toward the day should come first.
  const requiredBlocks = todayBlocks.filter((b) => !b.optional);
  const optionalBlocks = todayBlocks.filter((b) => b.optional);

  // The posture track, running underneath every phase.
  const inFoundation = new Set(day.foundation);
  const foundationBlocks = FOUNDATION
    .map((b) => ({ ...b, movements: b.movements.filter((m) => inFoundation.has(m.id)) }))
    .filter((b) => b.movements.length > 0);

  // Foundation ramps like everything else, so say so — one exercise on day 1
  // otherwise reads as "that's all there is".
  const allFoundationIds = FOUNDATION.flatMap((b) => b.movements.map((m) => m.id));
  const upcomingFoundation = allFoundationIds
    .filter((id) => !inFoundation.has(id))
    .map((id) => FOUNDATION_MOVEMENTS[id].name);

  const allRequired = [...day.required, ...day.foundation];
  const requiredDone = allRequired.filter((id) => done.has(id)).length;
  const dayComplete = requiredDone === allRequired.length;

  // In a transaction so rapid taps serialize instead of all reading the same
  // snapshot and clobbering each other.
  function patch(fields: Partial<CheckIn>) {
    return db.transaction('rw', db.checkins, async () => {
      const current: CheckIn = (await db.checkins.get(today)) ?? {
        date: today,
        pain: 0,
        didSession: false,
        walkedNoLimp: false,
      };
      await db.checkins.put({ ...current, ...fields });
    });
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Today</h1>
        <div className="page-sub">{DATE_FMT.format(new Date())}</div>
      </div>

      <div className="card phase-hero">
        <div className="phase-num">
          Phase {phase.id} · {phase.name}
        </div>
        <h2 className="phase-name">
          Day {dayNum} — {day.name}
        </h2>
        <div className="phase-headline">{day.intro}</div>
        <div className="day-dots" aria-label={`Day ${dayNum} of ${dayCount(phase.id)}`}>
          {Array.from({ length: dayCount(phase.id) }, (_, i) => (
            <span key={i} className={`day-dot${i + 1 < dayNum ? ' past' : ''}${i + 1 === dayNum ? ' now' : ''}`} />
          ))}
          {isSteady && <span className="day-repeat">repeats until the checkpoints pass</span>}
        </div>
      </div>

      <div className={`card day-status${dayComplete ? ' complete' : ''}`}>
        {dayComplete ? (
          <>
            <div className="eyebrow">Day {dayNum} complete</div>
            <p className="day-status-text">
              {isSteady
                ? 'That is the full session. Keep repeating this day — when the three checkpoints on Progress are all true, Phase ' +
                  (phase.id + 1) +
                  ' opens.'
                : `Nothing more to do today. If tomorrow morning feels no worse, Day ${dayNum + 1} unlocks on its own.`}
            </p>
            {dayNum > 1 && (
              <button className="btn ghost" type="button" onClick={() => repeatPreviousDay()}>
                It flared overnight — go back to Day {dayNum - 1}
              </button>
            )}
          </>
        ) : (
          <>
            <div className="eyebrow">Today's session</div>
            <p className="day-status-text">
              {requiredDone} of {allRequired.length} done —{' '}
              {day.required.length} rehab, {day.foundation.length} foundation.{' '}
              {allRequired.length <= 4 ? 'That is the whole day.' : 'Optional extras do not count toward it.'}
            </p>
          </>
        )}
      </div>

      <div className="card">
        <div className="eyebrow">Check in</div>
        <div style={{ fontSize: 15 }}>Worst pain today, 0–10</div>
        <div className="pain-scale">
          {Array.from({ length: 11 }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`pain-dot${checkin?.pain === i ? ' on' : ''}`}
              onClick={() => patch({ pain: i })}
            >
              {i}
            </button>
          ))}
        </div>

        <Toggle
          label="Walked today with no limp"
          on={!!checkin?.walkedNoLimp}
          onClick={() => patch({ walkedNoLimp: !checkin?.walkedNoLimp })}
        />
        <Toggle
          label="Did today's session"
          on={!!checkin?.didSession}
          onClick={() => patch({ didSession: !checkin?.didSession })}
        />

        {checkin && checkin.pain >= 5 && (
          <div className="block-note" style={{ marginBottom: 0 }}>
            Over 5/10 means today was too much. Drop back to the last thing that felt fine — that's not a
            setback, that's the rule working.
          </div>
        )}
      </div>

      {phase.avoid && phase.avoid.length > 0 && (
        <div className="card avoid">
          <div className="eyebrow">Not yet</div>
          <ul>
            {phase.avoid.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {requiredBlocks.map((block) => (
        <BlockCard
          key={block.title}
          block={block}
          done={done}
          onToggle={(id) => toggleMovementDone(today, id)}
        />
      ))}

      <div className="track-divider">
        <span>
          Foundation · {day.foundation.length} of {allFoundationIds.length} today
        </span>
      </div>
      <p className="track-intro">
        The posture rebuild — it runs every day of every phase and does not stop when the hamstring is
        better. There are {allFoundationIds.length} exercises in it, added a few at a time the same way the
        rehab work is. Today you get {day.foundation.length}.
      </p>

      {foundationBlocks.map((block) => (
        <BlockCard
          key={block.title}
          block={block}
          done={done}
          onToggle={(id) => toggleMovementDone(today, id)}
        />
      ))}

      {upcomingFoundation.length > 0 && (
        <div className="card upcoming">
          <div className="eyebrow">Joins later</div>
          <p className="day-status-text" style={{ marginBottom: 10 }}>
            Not today — these come in as each day holds up. All of them, with cues and videos, live in the
            Library.
          </p>
          <div className="upcoming-list">
            {upcomingFoundation.map((name) => (
              <span className="upcoming-chip" key={name}>
                {name}
              </span>
            ))}
          </div>
          <Link className="btn ghost" to="/library" style={{ marginTop: 14 }}>
            Open the Library
          </Link>
        </div>
      )}

      {optionalBlocks.map((block) => (
        <BlockCard
          key={block.title}
          block={block}
          done={done}
          onToggle={(id) => toggleMovementDone(today, id)}
        />
      ))}

      <div className="card">
        <div className="eyebrow">Call someone if</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {RED_FLAGS.map((f) => (
            <li key={f} style={{ fontSize: 14, margin: '5px 0', color: 'var(--text-dim)' }}>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`gate toggle-row${on ? ' on' : ''}`} onClick={onClick} style={{ width: '100%', background: 'none', border: 0, borderTop: '1px solid var(--border)', padding: '13px 0' }}>
      <span className="gate-box">{on && <IconCheck />}</span>
      <span className="gate-label">{label}</span>
    </button>
  );
}

function BlockCard({
  block,
  done,
  onToggle,
}: {
  block: Block;
  done: Set<string>;
  onToggle: (movementId: string) => void;
}) {
  const total = block.movements.length;
  const count = block.movements.filter((m) => done.has(m.id)).length;

  return (
    <div className="card">
      <div className="block-head">
        <div className="block-title">{block.title}</div>
        {block.optional ? (
          <span className="block-optional">Optional</span>
        ) : (
          <span className={`block-count${count === total ? ' all' : ''}`}>
            {count}/{total}
          </span>
        )}
      </div>
      {block.note && <div className="block-note">{block.note}</div>}
      {block.movements.map((m) => (
        <MovementItem key={m.id} m={m} done={done.has(m.id)} onToggle={() => onToggle(m.id)} />
      ))}
    </div>
  );
}
