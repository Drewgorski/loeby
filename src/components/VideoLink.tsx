import type { VideoRef } from '../program/content';
import { IconDoc, IconPlay } from './icons';

export default function VideoLink({ video }: { video: VideoRef }) {
  return (
    <a className="video-link" href={video.url} target="_blank" rel="noreferrer">
      {video.isVideo ? <IconPlay /> : <IconDoc />}
      <span>
        {video.title} <small>— {video.by}</small>
      </span>
    </a>
  );
}
