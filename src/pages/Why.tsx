import { GOALS } from '../program/content';

export default function Why() {
  return (
    <div className="page">
      <div className="page-head">
        <h1>Why</h1>
        <div className="page-sub">What this is actually for.</div>
      </div>

      <div className="card">
        <div className="eyebrow">The point</div>
        <p style={{ margin: 0, fontSize: 15.5 }}>
          The hamstring is the reason we started, not the reason we're here. The hamstring went twice
          because of how the whole system above it is arranged — a pelvis tipped forward, glutes that never
          get the work, ankles that don't move. Rehab it, then fix the thing that caused it, then build
          speed on top. That order is the entire program.
        </p>
      </div>

      <div className="card">
        <div className="eyebrow">Goals</div>
        {GOALS.map((g) => (
          <div className="goal" key={g.title}>
            <h3>{g.title}</h3>
            <p>{g.body}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
