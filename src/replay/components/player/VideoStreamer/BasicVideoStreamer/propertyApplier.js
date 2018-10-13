// @flow
import type { PlaybackProps } from '../types';
import type { TextTrackManager } from './textTrackManager';
import type { AudioTrackManager } from './audioTrackManager';
import type { StreamRangeHelper } from './streamRangeHelper';

export const applyProperties = (
  playbackProps: PlaybackProps,
  videoRef: { current: null | HTMLVideoElement },
  thirdPartyPlayer: any,
  streamRangeHelper: StreamRangeHelper,
  textTrackManager: ?TextTrackManager,
  audioTrackManager: ?AudioTrackManager
) => {
  if (videoRef.current) {
    if ('isPaused' in playbackProps) {
      if (playbackProps.isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    if (playbackProps.volume != null) {
      videoRef.current.volume = playbackProps.volume;
    }
    if (playbackProps.isMuted != null) {
      videoRef.current.muted = playbackProps.isMuted;
    }
    if (playbackProps.position != null) {
      streamRangeHelper.setPosition(playbackProps.position, videoRef.current, thirdPartyPlayer
      );
    }
    if (playbackProps.isAtLivePosition) {
      streamRangeHelper.gotoLive(videoRef.current, thirdPartyPlayer);
    }
  }
  if (textTrackManager && 'selectedTextTrack' in playbackProps) {
    textTrackManager.handleSelectedTextTrackChange(playbackProps.selectedTextTrack);
  }
  if (audioTrackManager && playbackProps.selectedAudioTrack) {
    audioTrackManager.handleSelectedAudioTrackChange(playbackProps.selectedAudioTrack);
  }
};
