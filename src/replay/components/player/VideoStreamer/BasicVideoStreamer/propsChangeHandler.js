//@ flow

import type { VideoStreamerProps } from '../types';
import { isDifferent } from '../../../common';

const processPropChanges = (
  videoRef: { current: ?HTMLVideoElement },
  prevProps: VideoStreamerProps,
  newProps: VideoStreamerProps
) => {
  if (videoRef.current) {
    if (newProps.isPaused != null && isDifferent(prevProps.isPaused, newProps.isPaused)) {
      if (newProps.isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    if (newProps.volume != null && isDifferent(prevProps.volume, newProps.volume)) {
      videoRef.current.volume = newProps.volume;
    }
    if (newProps.isMuted != null && isDifferent(prevProps.isMuted, newProps.isMuted)) {
      videoRef.current.muted = newProps.isMuted;
    }
  }
  // TODO: Text tracks, audio tracks.
};

export default processPropChanges;
