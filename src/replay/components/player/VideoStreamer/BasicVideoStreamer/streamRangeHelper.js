// @flow
import type { PlaybackMethods, PlayMode } from '../types';
import type { StreamRangeProps } from './streamStateUpdater';

export type StreamRangeHelper = PlaybackMethods & {
  setUpdater: (StreamRangeProps => void) => void,
  calculateNewState: () => void,
  startPauseStateUpdates: () => void,
  stopPauseStateUpdates: () => void
};

const dawnOfTime = new Date(0);
const defaultPauseUpdateInterval = 5; // seconds
const minimumDvrLength = 100; // seconds
const defaultLivePositionMargin = 10; // seconds
const dvrStartCorrection = 10; // yep, seconds

function getSeekableNetRange(videoElement: HTMLVideoElement): number {
  return videoElement.seekable.length > 0 ? videoElement.seekable.end(0) - videoElement.seekable.start(0) : 0;
}

function getPosition(videoElement: HTMLVideoElement): number {
  return videoElement.currentTime - (videoElement.seekable.length > 0 ? videoElement.seekable.start(0) : 0);
}

function getDuration(videoElement: HTMLVideoElement, isLive: boolean, seekableRange: number): number {
  return isLive ? seekableRange : videoElement.duration;
}

function getStartOffset(videoElement: HTMLVideoElement) {
  return videoElement.seekable.length > 0 ? videoElement.seekable.start(0) : 0;
}

function resolvePlayMode(videoElement: HTMLVideoElement, seekableRange: number, isLive: boolean): PlayMode {
  if (isLive) {
    if (seekableRange === Infinity || seekableRange === 0 || seekableRange < minimumDvrLength) {
      return 'live';
    } else {
      return 'livedvr';
    }
  } else {
    return 'ondemand';
  }
}

function getAbsolutePositions(
  videoElement: HTMLVideoElement,
  isLive: boolean,
  position: number
): { absolutePosition: Date, absoluteStartPosition: Date } {
  if (isLive) {
    // $FlowFixMe getStartDate() is Safari only and not part of the DOM standard API.
    const startDate: Date = videoElement.getStartDate && videoElement.getStartDate();
    if (isNaN(startDate)) {
      const absolutePosition = new Date();
      const absoluteStartPosition = new Date(absolutePosition.getTime() - position * 1000);
      return {
        absolutePosition,
        absoluteStartPosition
      };
    } else {
      return {
        absolutePosition: new Date(startDate.getTime() + videoElement.currentTime * 1000),
        absoluteStartPosition: new Date(startDate.getTime() + getStartOffset(videoElement) * 1000)
      };
    }
  } else {
    return {
      absolutePosition: dawnOfTime,
      absoluteStartPosition: dawnOfTime
    };
  }
}

const getStreamRangeHelper = (
  videoRef: { current: null | HTMLVideoElement },
  livePositionMargin: number = defaultLivePositionMargin,
  pauseUpdateInterval: number = defaultPauseUpdateInterval
): StreamRangeHelper => {
  let pauseUpdaterIntervalID: ?IntervalID;
  let update: StreamRangeProps => void = () => {};

  function calculateNewState() {
    const videoElement = videoRef.current;
    if (videoElement) {
      const seekableRange = getSeekableNetRange(videoElement);
      const isLive = videoElement.duration === Infinity;

      const position = getPosition(videoElement);
      const duration = getDuration(videoElement, isLive, seekableRange);
      const playMode = resolvePlayMode(videoElement, seekableRange, isLive);
      const isAtLivePosition = isLive && position > duration - livePositionMargin;
      const { absolutePosition, absoluteStartPosition } = getAbsolutePositions(videoElement, isLive, position);
      update({
        position,
        duration,
        playMode,
        isAtLivePosition,
        absolutePosition,
        absoluteStartPosition
      });
    }
  }

  function updatePausedState() {
    const videoElement = videoRef.current;
    if (videoElement && videoElement.paused && videoElement.duration === Infinity) {
      const seekableStart = getStartOffset(videoElement);
      if (seekableStart !== Infinity && seekableStart >= videoElement.currentTime) {
        videoElement.currentTime = seekableStart + dvrStartCorrection;
      }
    }
    calculateNewState();
  }
  
  function startPauseStateUpdates() {
    if (pauseUpdaterIntervalID) {
      clearInterval(pauseUpdaterIntervalID);
    }
    pauseUpdaterIntervalID = setInterval(updatePausedState, pauseUpdateInterval * 1000);
  }

  function stopPauseStateUpdates() {
    if (pauseUpdaterIntervalID) {
      clearInterval(pauseUpdaterIntervalID);
      pauseUpdaterIntervalID = null;
    }
  }

  function setPosition(newPosition: number) {
    const videoElement = videoRef.current;
    if (videoElement && !(isNaN(newPosition) && newPosition === Infinity)) {
      videoElement.currentTime = getStartOffset(videoElement) + newPosition;
    }
  }

  function gotoLive() {
    const videoElement = videoRef.current;
    if (videoElement && videoElement.duration === Infinity && videoElement.seekable.length > 0) {
      videoElement.currentTime = videoElement.seekable.end(0);
    }
  }
  
  function setUpdater(updateFn: StreamRangeProps => void) {
    update = updateFn;
  }
  
  return {
    setUpdater,
    calculateNewState,
    startPauseStateUpdates,
    stopPauseStateUpdates,
    setPosition,
    gotoLive
  };
};

export default getStreamRangeHelper;
