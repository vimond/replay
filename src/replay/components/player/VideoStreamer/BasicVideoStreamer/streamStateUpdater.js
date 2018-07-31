// @flow
import getFilteredPropertyUpdater from './filteredPropertyUpdater';
import BasicVideoStreamer from './BasicVideoStreamer';
import type { AvailableTrack, PlaybackSource, VideoStreamerProps, VideoStreamState } from '../types';
import mapError from './errorMapper';
import processPropChanges from './propsChangeHandler';
import type { TextTrackManager } from './textTrackManager';
import { getIntervalRunner } from '../../../common';

type PlaybackLifeCycle = 'new' | 'starting' | 'started' | 'ended' | 'dead' | 'unknown';

export type TextTracksStateProps = {
  textTracks: Array<AvailableTrack>,
  currentTextTrack: ?AvailableTrack
};

/*export type StreamRangeProps = {
  playMode: PlayMode,
  isAtLivePosition: boolean,
  position: number,
  duration: number,
  absolutePosition: Date,
  absoluteStartPosition: Date
};*/

export type StreamStateUpdater = {
  eventHandlers: { [string]: () => void },
  onTextTracksChanged: TextTracksStateProps => void,
  startPlaybackSession: () => void
};

const emptyTracks: Array<AvailableTrack> = []; // Keeping the same array instance for all updates as long as not in use.
const emptyBitrates: Array<number> = [];
const dawnOfTime = new Date(0);
const defaultPauseUpdateInterval = 5;

const saneNumberFilter = <T>(value: ?T) =>
  value == null || isNaN(value) || value === Infinity || typeof value !== 'number' || value < 0 ? 0 : value;

const filters = {
  position: saneNumberFilter,
  duration: saneNumberFilter,
  volume: saneNumberFilter
};

function seekToInitialPosition(source: ?PlaybackSource, videoElement: HTMLVideoElement) {
  if (source && typeof source.startPosition === 'number') {
    videoElement.currentTime = source.startPosition;
  }
}

function applyPlaybackProps(
  props: VideoStreamerProps,
  videoRef: { current: null | HTMLVideoElement },
  textTrackManager: ?TextTrackManager
) {
  processPropChanges(videoRef, textTrackManager, {}, props);
}

function calculateBufferedAhead(videoElement: HTMLVideoElement): number {
  const currentTime = videoElement.currentTime;
  const buffered = videoElement.buffered;
  let ahead = 0;

  for (let i = 0; i < buffered.length; ++i) {
    if (buffered.start(i) <= currentTime && buffered.end(i) >= currentTime) {
      ahead = buffered.end(i) - currentTime;
      break;
    }
  }
  return ahead;
}

function getStreamStateUpdater(streamer: BasicVideoStreamer, pauseUpdateInterval?: number = defaultPauseUpdateInterval) {
  let lifeCycleStage: PlaybackLifeCycle = 'unknown';
  const isSafari =
    navigator.userAgent.indexOf('Safari') > 0 &&
    navigator.userAgent.indexOf('Chrome') < 0 &&
    navigator.userAgent.indexOf('Firefox') < 0;

  const isDebugging = window.location.search.indexOf('debug') > 0;
  const streamRangeHelper = streamer.streamRangeHelper;
  let pauseStreamRangeUpdater = getIntervalRunner(onPauseInterval, pauseUpdateInterval);
  
  if (isDebugging) {
    window.videoElementEvents = [];
  }

  const log = isDebugging
    ? (eventName: string) => window.videoElementEvents.push(eventName)
    : (eventName: string) => {};

  function withVideoElement(operation: HTMLVideoElement => void) {
    streamer.videoRef.current && operation(streamer.videoRef.current);
  }

  function invokeOnStreamStateChange(property: VideoStreamState) {
    if (streamer.props.onStreamStateChange) {
      try {
        streamer.props.onStreamStateChange(property);
      } catch (e) {
        console.error('onStreamStateChange failed.', e);
      }
    }
  }

  function notifyInitialState() {
    update({ duration: 0 });
    update({ position: 0 });
    update({ playMode: 'ondemand' });
    update({ playState: 'inactive' });
    update({ isBuffering: false });
    update({ isPaused: false });
    update({ isSeeking: false });
    update({ volume: 1 });
    update({ muted: false });
    update({ bufferedAhead: 0 });
    update({ bitrates: emptyBitrates });
    update({ audioTracks: emptyTracks });
    update({ absolutePosition: dawnOfTime });
    update({ absoluteStartPosition: dawnOfTime });
  }

  function startPlaybackSession() {
    log('New session');
    lifeCycleStage = 'new';
    notifyInitialState();
    pauseStreamRangeUpdater.stop();
    // TODO: Notify closedown of previous session?
  }

  function onError() {
    withVideoElement(videoElement => {
      const playbackError = mapError(videoElement);
      if (streamer.props.onPlaybackError) {
        streamer.props.onPlaybackError(playbackError);
      }
      update({ error: videoElement.error });
      if (playbackError.severity === 'FATAL') {
        lifeCycleStage = 'dead';
        update({ playState: 'inactive' });
      }
      pauseStreamRangeUpdater.stop();
    });
    lifeCycleStage = 'dead';
  }

  function onLoadStart() {
    log('loadstart');
    if (lifeCycleStage === 'new') {
      lifeCycleStage = 'starting';
      withVideoElement(videoElement => {
        update({ playState: 'starting', isBuffering: true, volume: videoElement.volume, isMuted: videoElement.muted });
      });
    }
  }

  function onLoadedMetadata() {
    log('loadedmetadata');
    applyPlaybackProps(streamer.props, streamer.videoRef, streamer.textTrackManager);
    withVideoElement(videoElement => {
      seekToInitialPosition(streamer.props.source, videoElement);
      update(streamRangeHelper.calculateNewState(videoElement));
    });
  }

  function onCanPlay() {
    log('canplay');
    // If starting as paused, we consider "canplay" as completed starting. The playState must be updated accordingly.
    // When starting as playing, the starting to started transition is handled by the onPlaying handler.
    if (lifeCycleStage === 'starting') {
      if (streamer.props.isPaused) {
        lifeCycleStage = 'started';
      }
    }
    withVideoElement(videoElement => {
      if (videoElement.paused) {
        update({ playState: 'paused', isPaused: true, isBuffering: false, isSeeking: false });
        pauseStreamRangeUpdater.start();
      }
    });
  }

  function onWaiting() {
    log('waiting');
    if (lifeCycleStage === 'started') {
      update({ playState: 'buffering' });
    }
  }

  function onStalled() {
    log('stalled');
    // The stalled event is fired also after pausing in Safari.
    if (lifeCycleStage === 'started' && !isSafari) {
      update({ playState: 'buffering' });
    }
  }

  function onPlaying() {
    log('playing');
    // When this is invoked, and we are not starting as paused, we consider the playback as started.
    if (lifeCycleStage === 'starting') {
      lifeCycleStage = 'started';
    }
    if (lifeCycleStage === 'started') {
      update({ playState: 'playing', isBuffering: false, isPaused: false, isSeeking: false });
    }
    pauseStreamRangeUpdater.stop();
  }

  function onPause() {
    log('pause');
    if (lifeCycleStage === 'started') {
      update({ playState: 'paused', isPaused: true });
    }
    pauseStreamRangeUpdater.start();
  }

  function onSeeking() {
    log('seeking');
    pauseStreamRangeUpdater.stop();
    if (lifeCycleStage === 'started') {
      update({ playState: 'seeking', isSeeking: true });
    }
  }

  function onSeeked() {
    log('seeked');
    if (isSafari) {
      withVideoElement(videoElement => {
        if (videoElement.paused) {
          update({ playState: 'paused', isPaused: true, isBuffering: false, isSeeking: false });
          pauseStreamRangeUpdater.start();
        } else {
          update({ playState: 'playing', isPaused: false, isBuffering: false, isSeeking: false });
          pauseStreamRangeUpdater.stop();
        }
      });
    }
    /*if (lifeCycleStage === 'started') {
      withVideoElement(videoElement => {
        // TODO: The video element is always paused from before seek start to after seek end. Might need a workaround.
        if (videoElement.paused) {
          update({ playState: 'paused', isPaused: true });
        } else {
          update({ playState: 'playing', isPaused: false });
        }
      });
    }*/
  }

  function onDurationChange() {
    log('durationchange');
    withVideoElement(videoElement => {
      update(streamRangeHelper.calculateNewState(videoElement));
    });
  }

  function onTimeUpdate() {
    withVideoElement(videoElement => {
      update(streamRangeHelper.calculateNewState(videoElement));
    });
  }

  function onVolumeChange() {
    log('volumechange');
    withVideoElement(videoElement => {
      update({ volume: videoElement.volume, isMuted: videoElement.muted });
    });
  }

  function onProgress() {
    log('progress');
    withVideoElement(videoElement => {
      update({ bufferedAhead: calculateBufferedAhead(videoElement) });
    });
  }

  function onEnded() {
    log('ended');
    if (lifeCycleStage === 'started') {
      lifeCycleStage = 'ended';
      update({ playState: 'inactive' });
    }
    pauseStreamRangeUpdater.stop();
  }

  function onPauseInterval() {
    withVideoElement(videoElement => {
      streamRangeHelper.adjustForDvrStartOffset(videoElement);
      update(streamRangeHelper.calculateNewState(videoElement));
    });
  }
  
  function onTextTracksChanged(textTracksStateProps: TextTracksStateProps) {
    // Silly object remapping because of Flow not understanding that TextTracksStateProps always satisfies VideoStreamState.
    update({
      currentTextTrack: textTracksStateProps.currentTextTrack,
      textTracks: textTracksStateProps.textTracks
    });
  }

  // TODO: Audio tracks.
  
  const update = getFilteredPropertyUpdater(invokeOnStreamStateChange, filters).notifyPropertyChange;

  return {
    eventHandlers: {
      onLoadStart,
      onLoadedMetadata,
      onCanPlay,
      onWaiting,
      onStalled,
      onPlaying,
      onPause,
      onSeeking,
      onSeeked,
      onDurationChange,
      onTimeUpdate,
      onVolumeChange,
      onProgress,
      onError,
      onEnded
    },
    onTextTracksChanged,
    startPlaybackSession
  };
}

export default getStreamStateUpdater;
