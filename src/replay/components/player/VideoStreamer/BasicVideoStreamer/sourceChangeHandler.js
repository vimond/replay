// @flow
import type { PlaybackSource } from '../types';

export default function getSourceChangeHandler(videoElement: HTMLVideoElement) {
  const handleSourceChange = <P: { source?: ?PlaybackSource }>({ source }: P, prevProps: ?P) => {
    const streamUrl = source ? (typeof source === 'string' ? source : source.streamUrl) : undefined;
    if (streamUrl) {
      videoElement.src = streamUrl;
    } else if (videoElement.src) {
      videoElement.removeAttribute('src');
      videoElement.load();
    }
    return Promise.resolve();
  };
  return handleSourceChange;
}
