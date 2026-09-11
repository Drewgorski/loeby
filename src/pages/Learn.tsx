import { LESSONS } from '../program/content';
import VideoLink from '../components/VideoLink';

export default function Learn() {
  return (
    <div className="page">
      <div className="page-head">
        <h1>Learn</h1>
        <div className="page-sub">
          Short. Mechanism, not motivation. Read one when you're curious why you're doing something.
        </div>
      </div>

      {LESSONS.map((l) => (
        <div className="card lesson" key={l.id}>
          <h2 className="lesson-title">{l.title}</h2>
          <p>{l.whatsHappening}</p>
          <p>{l.whatItFixes}</p>
          <p className="changes">{l.whatChanges}</p>
          {l.video && <VideoLink video={l.video} />}
        </div>
      ))}
    </div>
  );
}
