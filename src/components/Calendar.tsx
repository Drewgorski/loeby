import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, startOfDay, type CheckIn } from '../db/db';
import { MOVEMENT_BY_ID, dayFor } from '../program/content';

const MONTH_FMT = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
const FULL_FMT = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Monday-first offset for the 1st of the month. */
function leadingBlanks(year: number, month: number): number {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

type DayStatus = {
  kind: 'complete' | 'partial' | 'logged' | 'none';
  doneIds: string[];
  hit: number;
  total: number;
  on?: { phase: number; day: number };
};

export default function Calendar() {
  const today = startOfDay();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [picked, setPicked] = useState<number | null>(today);

  const from = new Date(cursor.y, cursor.m, 1).getTime();
  const to = new Date(cursor.y, cursor.m + 1, 1).getTime();

  const checkins = useLiveQuery(
    () => db.checkins.where('date').between(from, to, true, false).toArray(),
    [from, to],
  );
  const ticks = useLiveQuery(
    () => db.done.where('date').between(from, to, true, false).toArray(),
    [from, to],
  );
  const journal = useLiveQuery(
    () => db.journal.where('date').between(from, to, true, false).toArray(),
    [from, to],
  );

  if (!checkins || !ticks || !journal) return null;

  const checkinBy = new Map(checkins.map((c) => [c.date, c]));
  const journalBy = new Map(journal.map((j) => [j.date, j]));
  const ticksBy = new Map<number, string[]>();
  for (const t of ticks) {
    const list = ticksBy.get(t.date) ?? [];
    list.push(t.movementId);
    ticksBy.set(t.date, list);
  }

  /** How a date should read on the grid. */
  function statusOf(date: number): DayStatus {
    const on = journalBy.get(date);
    const doneIds = ticksBy.get(date) ?? [];
    if (!on) {
      const kind = doneIds.length ? 'partial' : checkinBy.has(date) ? 'logged' : 'none';
      return { kind, doneIds, hit: doneIds.length, total: 0 };
    }
    const d = dayFor(on.phase, on.day);
    const req = [...d.required, ...d.foundation];
    const hit = req.filter((id) => doneIds.includes(id)).length;
    const kind =
      hit === req.length && req.length > 0
        ? 'complete'
        : hit > 0
          ? 'partial'
          : checkinBy.has(date)
            ? 'logged'
            : 'none';
    return { kind, doneIds, hit, total: req.length, on };
  }

  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(leadingBlanks(cursor.y, cursor.m)).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(cursor.y, cursor.m, i + 1).getTime()),
  ];

  const completedThisMonth = cells.filter(
    (d) => d !== null && statusOf(d).kind === 'complete',
  ).length;

  return (
    <>
      <div className="card">
        <div className="cal-head">
          <button
            type="button"
            className="cal-nav"
            aria-label="Previous month"
            onClick={() => setCursor((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { ...c, m: c.m - 1 }))}
          >
            ‹
          </button>
          <div className="cal-month">{MONTH_FMT.format(new Date(cursor.y, cursor.m, 1))}</div>
          <button
            type="button"
            className="cal-nav"
            aria-label="Next month"
            disabled={new Date(cursor.y, cursor.m + 1, 1).getTime() > today}
            onClick={() => setCursor((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { ...c, m: c.m + 1 }))}
          >
            ›
          </button>
        </div>

        <div className="cal-grid cal-dow">
          {WEEKDAYS.map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>

        <div className="cal-grid">
          {cells.map((date, i) =>
            date === null ? (
              <div key={`b${i}`} />
            ) : (
              <button
                type="button"
                key={date}
                className={[
                  'cal-day',
                  statusOf(date).kind,
                  date === today ? 'today' : '',
                  date === picked ? 'picked' : '',
                  date > today ? 'future' : '',
                ].join(' ')}
                disabled={date > today}
                onClick={() => setPicked(date === picked ? null : date)}
              >
                {new Date(date).getDate()}
              </button>
            ),
          )}
        </div>

        <div className="cal-legend">
          <span><i className="sw complete" /> complete</span>
          <span><i className="sw partial" /> partial</span>
          <span><i className="sw logged" /> checked in</span>
        </div>
        <p className="day-status-text" style={{ marginTop: 10 }}>
          {completedThisMonth} day{completedThisMonth === 1 ? '' : 's'} completed this month.
        </p>
      </div>

      {picked !== null && <DayDetail date={picked} status={statusOf(picked)} checkin={checkinBy.get(picked)} />}
    </>
  );
}

function DayDetail({
  date,
  status,
  checkin,
}: {
  date: number;
  status: DayStatus;
  checkin?: CheckIn;
}) {
  const on = status.on;
  const prescribed = on ? dayFor(on.phase, on.day) : null;
  const req = prescribed ? [...prescribed.required, ...prescribed.foundation] : [];

  return (
    <div className="card">
      <div className="eyebrow">{FULL_FMT.format(new Date(date))}</div>
      {prescribed && on ? (
        <h3 style={{ fontSize: 19, marginBottom: 8 }}>
          Phase {on.phase} · Day {on.day} — {prescribed.name}
        </h3>
      ) : (
        <p className="day-status-text">Nothing recorded for this day.</p>
      )}

      {checkin && (
        <p className="day-status-text" style={{ marginBottom: 12 }}>
          Pain {checkin.pain}/10 · {checkin.walkedNoLimp ? 'walked with no limp' : 'still limping'}
        </p>
      )}

      {req.length > 0 && (
        <>
          <p className="day-status-text" style={{ marginBottom: 10 }}>
            {status.hit} of {req.length} done
            {status.kind === 'complete' ? ' — completed' : ''}
          </p>
          <div className="cal-items">
            {req.map((id) => (
              <span key={id} className={`cal-item${status.doneIds.includes(id) ? ' on' : ''}`}>
                {MOVEMENT_BY_ID[id]?.name ?? id}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
