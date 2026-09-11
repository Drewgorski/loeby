import { useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  POSES, POSE_LABEL, db, deletePhoto, readState, savePhoto, startOfDay,
  type Pose, type PosturePhoto,
} from '../db/db';

const SHORT = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

/**
 * Object URLs must be revoked, or every re-render leaks another blob handle.
 * Falls back to the Storage URL for photos restored on a device that has the
 * metadata but not the bytes.
 */
function usePhotoUrl(photo?: PosturePhoto): string | undefined {
  const [url, setUrl] = useState<string>();
  const blob = photo?.blob;
  const remote = photo?.url;
  useEffect(() => {
    if (blob) {
      const u = URL.createObjectURL(blob);
      setUrl(u);
      return () => URL.revokeObjectURL(u);
    }
    setUrl(remote);
  }, [blob, remote]);
  return url;
}

function Shot({ photo, alt }: { photo?: PosturePhoto; alt: string }) {
  const url = usePhotoUrl(photo);
  // A cloud photo whose bytes have gone missing should read as absent, not as a
  // broken image icon.
  const [failed, setFailed] = useState(false);
  if (!photo || !url || failed) return <div className="shot empty">none yet</div>;
  return (
    <figure className="shot">
      <img src={url} alt={alt} onError={() => setFailed(true)} />
      <figcaption>
        {SHORT.format(new Date(photo.date))} · P{photo.phase} D{photo.day}
      </figcaption>
    </figure>
  );
}

export default function PostureShots() {
  const state = useLiveQuery(() => readState(), []);
  const photos = useLiveQuery(() => db.photos.toArray(), []);
  const [pose, setPose] = useState<Pose>('left');
  const [compareTo, setCompareTo] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const today = startOfDay();

  const forPose = useMemo(
    () => (photos ?? []).filter((p) => p.pose === pose).sort((a, b) => a.date - b.date),
    [photos, pose],
  );

  if (!state || !photos) return null;

  // "left side photo" reads better than "left photo"; front/back need no suffix.
  const poseWord =
    pose === 'left' || pose === 'right' ? `${POSE_LABEL[pose].toLowerCase()} side` : POSE_LABEL[pose].toLowerCase();

  const first = forPose[0];
  const latest = forPose[forPose.length - 1];
  const chosen = compareTo != null ? forPose.find((p) => p.date === compareTo) : latest;
  const hasPair = forPose.length > 1;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !state) return;
    await savePhoto(today, pose, file, state.phase, state.day ?? 1);
  }

  return (
    <>
      <div className="card">
        <div className="eyebrow">Posture photos</div>
        <p className="day-status-text" style={{ marginBottom: 14 }}>
          Anterior pelvic tilt is a position, which means it is visible. The side shots are the ones that
          show it — take both, because your two sides are not the same and with one injured leg they are
          about to be even less the same. All four every couple of weeks, not daily; this changes slowly,
          and watching it daily only makes it look like nothing is happening.
        </p>

        <div className="phase-tabs" role="tablist" aria-label="Pose">
          {POSES.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={p === pose}
              className={`phase-tab${p === pose ? ' on' : ''}`}
              onClick={() => {
                setPose(p);
                setCompareTo(null);
              }}
            >
              {POSE_LABEL[p]}
            </button>
          ))}
        </div>

        <div className="shot-pair">
          <div>
            <div className="shot-label">First</div>
            <Shot photo={first} alt={`First ${POSE_LABEL[pose]} photo`} />
          </div>
          <div>
            <div className="shot-label">{chosen && chosen.date === first?.date ? 'Same shot' : 'Now'}</div>
            <Shot photo={chosen} alt={`Latest ${POSE_LABEL[pose]} photo`} />
          </div>
        </div>

        {!hasPair && forPose.length > 0 && (
          <p className="day-status-text" style={{ marginTop: 12 }}>
            One photo so far. The comparison appears as soon as there is a second.
          </p>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFile}
          style={{ display: 'none' }}
        />
        <button type="button" className="btn primary block" style={{ marginTop: 16 }} onClick={() => fileRef.current?.click()}>
          {forPose.some((p) => p.date === today) ? `Retake today's ${poseWord} photo` : `Add ${poseWord} photo`}
        </button>

        <details className="how-to">
          <summary>How to take these so they're actually comparable</summary>
          <ul>
            <li>Same spot, same light, same distance — mark the floor with tape.</li>
            <li>Phone at hip height, propped, not held by someone taller one week and shorter the next.</li>
            <li>Stand how you normally stand. Do not correct your posture for the photo — that defeats it.</li>
            <li>Fitted clothing, so the line of your back and pelvis is visible. Preferably underwear and bra.</li>
            <li>Arms relaxed at your sides for front and back; side shots with arms hanging naturally.</li>
            <li>Left and right mean the side of your body facing the camera — keep that consistent each time.</li>
          </ul>
        </details>
      </div>

      {forPose.length > 0 && (
        <div className="card">
          <div className="eyebrow">{poseWord} timeline</div>
          <div className="shot-strip">
            {forPose.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`strip-item${chosen?.id === p.id ? ' on' : ''}`}
                onClick={() => setCompareTo(p.date)}
              >
                <StripThumb photo={p} />
                <span>{SHORT.format(new Date(p.date))}</span>
              </button>
            ))}
          </div>
          {chosen && (
            <button
              type="button"
              className="btn ghost"
              style={{ marginTop: 14 }}
              onClick={() => {
                if (confirm(`Delete the ${poseWord} photo from ${SHORT.format(new Date(chosen.date))}?`)) {
                  deletePhoto(chosen.id);
                  setCompareTo(null);
                }
              }}
            >
              Delete the selected photo
            </button>
          )}
        </div>
      )}
    </>
  );
}

function StripThumb({ photo }: { photo: PosturePhoto }) {
  const url = usePhotoUrl(photo);
  const [failed, setFailed] = useState(false);
  return url && !failed ? (
    <img src={url} alt="" onError={() => setFailed(true)} />
  ) : (
    <div className="shot empty" />
  );
}
