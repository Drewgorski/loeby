import { useLiveQuery } from 'dexie-react-hooks';
import { doneOn, readState, startOfDay } from '../db/db';
import { MOVEMENT_BY_ID, dayCount, dayFor } from '../program/content';

/**
 * What tomorrow becomes, and what it depends on. The day only advances on a
 * completed day followed by a clean morning, so this states both conditions
 * rather than promising a date.
 */
export default function Tomorrow() {
  const state = useLiveQuery(() => readState(), []);
  const today = startOfDay();
  const doneIds = useLiveQuery(() => doneOn(today), [today]);

  if (!state || !doneIds) return null;

  const phase = state.phase;
  const dayNum = state.day ?? 1;
  const day = dayFor(phase, dayNum);
  const required = [...day.required, ...day.foundation];
  const remaining = required.filter((id) => !doneIds.includes(id));
  const complete = remaining.length === 0;

  const isSteady = dayNum >= dayCount(phase);
  const next = dayFor(phase, dayNum + 1);
  const nextIds = [...next.required, ...next.foundation];
  const newTomorrow = nextIds.filter((id) => !required.includes(id));

  return (
    <div className={`card tomorrow${complete ? ' ready' : ''}`}>
      <div className="eyebrow">Tomorrow</div>

      {isSteady ? (
        <>
          <h3 className="tomorrow-title">Day {dayNum} again — {day.name}</h3>
          <p className="day-status-text">
            This is the repeating day for this phase. It stays the same until every checkpoint above is
            true{phase < 4 ? `, and then Phase ${phase + 1} opens at its own Day 1.` : '.'}
          </p>
        </>
      ) : (
        <>
          <h3 className="tomorrow-title">
            Day {dayNum + 1} — {next.name}
          </h3>
          <p className="day-status-text">
            {complete
              ? `Today is done. If tomorrow morning is no worse than this morning, Day ${dayNum + 1} unlocks on its own.`
              : `Day ${dayNum + 1} unlocks once today is finished and the next morning comes back clean. ${remaining.length} left today.`}
          </p>

          {newTomorrow.length > 0 && (
            <>
              <div className="eyebrow" style={{ marginTop: 16 }}>New tomorrow</div>
              <div className="cal-items">
                {newTomorrow.map((id) => (
                  <span className="cal-item" key={id}>
                    {MOVEMENT_BY_ID[id]?.name ?? id}
                  </span>
                ))}
              </div>
            </>
          )}

          <p className="tomorrow-rule">
            If it is worse in the morning, tomorrow is Day {dayNum} again. That is the rule working, not a
            setback.
          </p>
        </>
      )}
    </div>
  );
}
