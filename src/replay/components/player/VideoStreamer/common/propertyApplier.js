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
      videoElement.play().catch(err => console.warn('Play blocked', err));
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
  // $FlowFixMe: Type defs not up-to-date.
  if ('isPipActive' in playbackProps) {
    if (playbackProps.isPipActive) {
      // $FlowFixMe
      if (typeof videoElement.requestPictureInPicture === 'function') {
        videoElement.requestPictureInPicture();
        // $FlowFixMe
      } else if (typeof videoElement.webkitSetPresentationMode === 'function') {
        videoElement.webkitSetPresentationMode('picture-in-picture');
      }
      // $FlowFixMe
    } else if (document.pictureInPictureElement === videoElement) {
      // $FlowFixMe
      document.exitPictureInPicture();
      // $FlowFixMe
    } else if (videoElement.webkitPresentationMode === 'picture-in-picture') {
      // $FlowFixMe
      videoElement.webkitSetPresentationMode('inline');
    }
  }
  // $FlowFixMe: Type defs not up-to-date.
  if (playbackProps.isAirPlayTargetPickerVisible && typeof videoElement.webkitShowPlaybackTargetPicker === 'function') {
    videoElement.webkitShowPlaybackTargetPicker();
  }
};
