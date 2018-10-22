// @flow
import type { AvailableTrack, VideoStreamState } from '../types';
import type { PlaybackLifeCycle } from './types';

export const emptyTracks: Array<AvailableTrack> = []; // Keeping the same array instance for all updates as long as not in use.
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
    textTracks: emptyTracks,
    absolutePosition: dawnOfTime,
    absoluteStartPosition: dawnOfTime
  });
}

function getPlaybackLifeCycleManager(
  updateStreamState: VideoStreamState => void,
  pauseStreamRangeUpdater: {
    start: () => void,
    stop: () => void
  },
  log?: string => void
) {
  let lifeCycleStage: PlaybackLifeCycle = 'unknown';
  log && log(lifeCycleStage);

  function getStage() {
    return lifeCycleStage;
  }

  function setStage(newValue: PlaybackLifeCycle) {
    log && log(newValue);
    lifeCycleStage = newValue;
  }

  function startPlaybackSession() {
    setStage('new');
    notifyInitialState(updateStreamState);
    pauseStreamRangeUpdater.stop();
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
