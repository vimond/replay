// @flow
import type { PlaybackSource } from '../types';
import normalizeSource from '../common/sourceNormalizer';

export default function getSourceChangeHandler(videoElement: HTMLVideoElement) {
  const handleSourceChange = <P: { source?: ?PlaybackSource }>({ source }: P, prevProps: ?P) => {
    const n = normalizeSource(source);
    if (n && n.streamUrl) {
      if (typeof n.startPosition === 'number' && n.streamUrl.indexOf('#t=') < 0) {
        videoElement.src = `${n.streamUrl}#t=${n.startPosition.toFixed(2)}`;
      } else {
        videoElement.src = n.streamUrl;
      }
    } else if (videoElement.src) {
      videoElement.removeAttribute('src');
      videoElement.load();
    }
    return Promise.resolve();
  };
  return handleSourceChange;
}
