//@ flow

import type { VideoStreamerProps } from '../types';
import { isDifferent } from '../../../common';
import type { TextTrackManager } from './textTrackManager';

const processPropChanges = (
  videoRef: { current: ?HTMLVideoElement },
  textTrackManager: ?TextTrackManager,
  prevProps: VideoStreamerProps,
  nextProps: VideoStreamerProps
) => {
  if (videoRef.current) {
    if (nextProps.isPaused != null && isDifferent(prevProps.isPaused, nextProps.isPaused)) {
      if (nextProps.isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    if (nextProps.volume != null && isDifferent(prevProps.volume, nextProps.volume)) {
      videoRef.current.volume = nextProps.volume;
    }
    if (nextProps.isMuted != null && isDifferent(prevProps.isMuted, nextProps.isMuted)) {
      videoRef.current.muted = nextProps.isMuted;
    }
    if (textTrackManager) {
      if (prevProps.source !== nextProps.source || prevProps.textTracks !== nextProps.textTracks) {
        textTrackManager.handleNewSourceProps(nextProps);
      }
      if (nextProps.selectedTextTrack != null && isDifferent(prevProps.selectedTextTrack, nextProps.selectedTextTrack)) {
        textTrackManager.handleSelectedTextTrackChange(nextProps.selectedTextTrack);
      }
    }
  }
  // TODO: Audio tracks.
};

export default processPropChanges;
