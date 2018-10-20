// @flow
import type { AvailableTrack, VideoStreamState } from '../types';
import type { PlaybackLifeCycle } from './types';

const emptyTracks: Array<AvailableTrack> = []; // Keeping the same array instance for all updates as long as not in use.
const emptyBitrates: Array<number> = [];
const dawnOfTime = new Date(0);

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

function getPlaybackLifeCycleManager(
  updateStreamState: VideoStreamState => void,
  pauseStreamRangeUpdater: {
    start: () => void,
    stop: () => void
  }
) {
  const isDebugging = window.location.search.indexOf('debug') > 0;
  if (isDebugging) {
    window.videoElementEvents = [];
  }

  let lifeCycleStage: PlaybackLifeCycle = 'unknown';

  const log = isDebugging
    ? (eventName: string) => window.videoElementEvents.push(eventName)
    : (eventName: string) => {};

  function getStage() {
    return lifeCycleStage;
  }

  function setStage(newValue: PlaybackLifeCycle) {
    lifeCycleStage = newValue;
  }

  function startPlaybackSession() {
    log('New session');
    lifeCycleStage = 'new';
    notifyInitialState(updateStreamState);
    pauseStreamRangeUpdater.stop(); // TODO: Must be started if initial isPaused.
  }

  function cleanup() {
    pauseStreamRangeUpdater.stop();
  }
  
  return {
    startPlaybackSession,
    getStage,
    setStage,
    cleanup
  };
}

export default getPlaybackLifeCycleManager;
