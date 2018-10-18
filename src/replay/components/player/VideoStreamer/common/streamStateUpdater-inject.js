// @xflow
import getFilteredPropertyUpdater from './filteredPropertyUpdater';
import type {
  AvailableTrack,
  PlaybackSource,
  VideoStreamerProps,
  VideoStreamState
} from '../types';
import mapError from '../BasicVideoStreamer/errorMapper';
import { getIntervalRunner } from '../../../common';
import { applyProperties } from './propertyApplier';
import type { StreamRangeHelper } from '../BasicVideoStreamer/streamRangeHelper';
import type { TextTrackManager } from '../BasicVideoStreamer/textTrackManager';
import type { AudioTrackManager } from '../BasicVideoStreamer/audioTrackManager';
import type { AudioTracksStateProps, TextTracksStateProps } from '../BasicVideoStreamer/streamStateUpdater';

export type PlaybackLifeCycle = 'new' | 'starting' | 'started' | 'ended' | 'dead' | 'unknown';

type VideoStreamer<T: VideoStreamerProps> = {
  props: T,
  thirdPartyPlayer?: any,
  streamRangeHelper: StreamRangeHelper,
  videoRef: { current: null | HTMLVideoElement },
  textTrackManager: TextTrackManager,
  audioTrackManager: AudioTrackManager
};

export type StreamStateUpdater = {
  eventHandlers: { [string]: () => void },
  //onTextTracksChanged: TextTracksStateProps => void,
  //onAudioTracksChanged: AudioTracksStateProps => void,
  startPlaybackSession: () => void
};

const emptyTracks: Array<AvailableTrack> = []; // Keeping the same array instance for all updates as long as not in use.
const emptyBitrates: Array<number> = [];
const dawnOfTime = new Date(0);
const defaultPauseUpdateInterval = 5;

function getStreamStateUpdater<T: VideoStreamerProps>(
  streamer: VideoStreamer<T>,
  pauseUpdateInterval?: number = defaultPauseUpdateInterval
) {
  let lifeCycleStage: PlaybackLifeCycle = 'unknown';

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
      } catch (e) {}
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
  }

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
    onAudioTracksChanged,
    startPlaybackSession
  };
}

export default getStreamStateUpdater;
