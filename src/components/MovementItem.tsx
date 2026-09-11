import type { Movement } from '../program/content';
import { IconCheck } from './icons';
import VideoLink from './VideoLink';

/**
 * One exercise. Shared by Today and the Library — pass `onToggle` to get the
 * daily tick, omit it for the read-only reference view.
 */
export default function MovementItem({
  m,
  done = false,
  onToggle,
  tag,
}: {
  m: Movement;
  done?: boolean;
  onToggle?: () => void;
  /** Small chip beside the name, e.g. marking it as part of today's session. */
  tag?: string;
}) {
  return (
    <div className={`movement${done ? ' done' : ''}`}>
      <div className="movement-head">
        {onToggle && (
          <button
            type="button"
            className="tick"
            aria-pressed={done}
            aria-label={`Mark ${m.name} done`}
            onClick={onToggle}
          >
            {done && <IconCheck />}
          </button>
        )}
        <span className="movement-title">
          <span className="movement-name">{m.name}</span>
          {tag && <span className="movement-tag">{tag}</span>}
          <span className="movement-dose">{m.dose}</span>
        </span>
      </div>
      <div className="movement-cue">{m.cue}</div>
      {m.why && (
        <div className="movement-why">
          <span className="why-label">Why</span>
          {m.why}
        </div>
      )}
      {m.video && <VideoLink video={m.video} />}
    </div>
  );
}
