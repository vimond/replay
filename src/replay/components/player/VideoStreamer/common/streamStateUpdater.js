// @flow
import type {
  AvailableTrack, PlaybackProps, VideoStreamerConfiguration,
  VideoStreamerImplProps,
  VideoStreamState
} from '../types';
import { getIntervalRunner } from '../../../common';
import type { GetVideoEventHandlers, PlaybackLifeCycle, SimplifiedVideoStreamer, StreamRangeHelper } from './types';

const emptyTracks: Array<AvailableTrack> = []; // Keeping the same array instance for all updates as long as not in use.
const emptyBitrates: Array<number> = [];
const dawnOfTime = new Date(0);
const defaultPauseUpdateInterval = 5;

function notifyInitialState(updateStreamState: VideoStreamState => void) {
  updateStreamState({ 
    duration: 0,
    position: 0,
    playMode: 'ondemand',
    playState: 'inactive',
    isBuffering: false,
    isPaused: false,
    isSeeking: false,
    volume: 1,
    muted: false,
    bufferedAhead: 0,
    bitrates: emptyBitrates,
    audioTracks: emptyTracks,
    absolutePosition: dawnOfTime,
    absoluteStartPosition: dawnOfTime 
  });
}

// TODO: Ingen grunn til passthrough av alt til getEventHandlers. Skill ut til komposisjon.

function getStreamStateUpdater<C: VideoStreamerConfiguration, P: VideoStreamerImplProps<C>>(
  streamer: SimplifiedVideoStreamer<C, P>,
  videoElement: HTMLVideoElement,
  thirdPartyPlayer: any,
  updateStreamState: VideoStreamState => void,
  applyProperties: PlaybackProps => void,
  streamRangeHelper: StreamRangeHelper,
  getEventHandlers: GetVideoEventHandlers<C, P>,
  pauseUpdateInterval?: number = defaultPauseUpdateInterval
) {
  const isDebugging = window.location.search.indexOf('debug') > 0;
  if (isDebugging) {
    window.videoElementEvents = [];
  }
  
  let lifeCycleStage: PlaybackLifeCycle = 'unknown';
  let onPauseInterval = () => {};
  let pauseStreamRangeUpdater = getIntervalRunner(() => onPauseInterval(), pauseUpdateInterval);


  const log = isDebugging
    ? (eventName: string) => window.videoElementEvents.push(eventName)
    : (eventName: string) => {};

  
  function getLifeCycle() {
    return lifeCycleStage;
  }
  
  function setLifeCycle(newValue) {
    lifeCycleStage = newValue;
  }

  function startPlaybackSession() {
    log('New session');
    lifeCycleStage = 'new';
    notifyInitialState(updateStreamState);
    pauseStreamRangeUpdater.stop();
  }

  function cleanup() {
    pauseStreamRangeUpdater.stop();
    impl.cleanup();
  }
  
  const impl = getEventHandlers({
    streamer,
    videoElement,
    thirdPartyPlayer,
    streamRangeHelper,
    pauseStreamRangeUpdater,
    applyProperties,
    updateStreamState,
    // Disse må sendes inn til eventHandlers i stedet, eller kanskje skilles ut.
    getLifeCycle,
    setLifeCycle
  });

  const { videoElementEventHandlers } = impl;
 
  onPauseInterval = impl.onPauseInterval;


  return {
    videoElementEventHandlers,
    startPlaybackSession,
    cleanup
  };
}

export default getStreamStateUpdater;
