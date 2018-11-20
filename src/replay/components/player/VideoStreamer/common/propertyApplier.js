// @flow
import type { PlaybackProps } from '../types';
import type { AudioTrackManager, BitrateManager, StreamRangeHelper, TextTrackManager } from './types';

export const getPropertyApplier = (
  videoElement: HTMLVideoElement, // Abstract this away?
  streamRangeHelper: StreamRangeHelper,
  textTrackManager?: TextTrackManager,
  audioTrackManager?: AudioTrackManager,
  bitrateManager?: ?BitrateManager
) => (playbackProps: PlaybackProps) => {
  if ('isPaused' in playbackProps) {
    if (playbackProps.isPaused) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  }
  if (playbackProps.volume != null) {
    videoElement.volume = playbackProps.volume;
  }
  if (playbackProps.isMuted != null) {
    videoElement.muted = playbackProps.isMuted;
  }
  if (playbackProps.position != null) {
    streamRangeHelper.setPosition(playbackProps.position);
  }
  if (playbackProps.isAtLiveEdge) {
    streamRangeHelper.gotoLive();
  }
  if (textTrackManager && 'selectedTextTrack' in playbackProps) {
    textTrackManager.handleSelectedTextTrackChange(playbackProps.selectedTextTrack);
  }
  if (audioTrackManager && playbackProps.selectedAudioTrack) {
    audioTrackManager.handleSelectedAudioTrackChange(playbackProps.selectedAudioTrack);
  }
  if (bitrateManager) {
    if (playbackProps.bitrateFix !== undefined) {
      // $FlowFixMe undefined is OK.
      bitrateManager.fixBitrate(playbackProps.bitrateFix);
    }
    if (playbackProps.bitrateCap !== undefined) {
      // $FlowFixMe undefined is OK.
      bitrateManager.capBitrate(playbackProps.bitrateCap);
    }
  }
};
