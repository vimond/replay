// @flow
import type { PlayMode, VideoStreamState } from '../types';
import type { ShakaPlayer } from './types';

export type StreamRangeHelper = {
  adjustForDvrStartOffset: (HTMLVideoElement, ShakaPlayer) => void,
  calculateNewState: (HTMLVideoElement, ShakaPlayer) => VideoStreamState,
  setPosition: (HTMLVideoElement, ShakaPlayer, number) => void,
  gotoLive: (HTMLVideoElement, ShakaPlayer) => void
};

const dawnOfTime = new Date(0);
const minimumDvrLength = 100; // seconds
const defaultLivePositionMargin = 10; // seconds
const dvrStartCorrection = 10; // yep, seconds

function resolvePlayMode(duration: number, isLive: boolean): PlayMode {
  if (isLive) {
    if (duration === Infinity || duration === 0 || duration < minimumDvrLength) {
      return 'live';
    } else {
      return 'livedvr';
    }
  } else {
    return 'ondemand';
  }
}

function getAbsolutePositions(
  isLive: boolean,
  startDateTime: Date,
  seekRange: { start: number, end: number },
  position: number
): { absolutePosition: Date, absoluteStartPosition: Date } {
  if (isLive) {
    if (isNaN(startDateTime)) {
      const absolutePosition = new Date();
      const absoluteStartPosition = new Date(absolutePosition.getTime() - position * 1000);
      return {
        absolutePosition,
        absoluteStartPosition
      };
    } else {
      return {
        absolutePosition: new Date(startDateTime.getTime() + (position + seekRange.start) * 1000),
        absoluteStartPosition: new Date(startDateTime.getTime() + seekRange.start * 1000)
      };
    }
  } else {
    return {
      absolutePosition: dawnOfTime,
      absoluteStartPosition: dawnOfTime
    };
  }
}

const getStreamRangeHelper = (liveEdgeMargin: ?number): StreamRangeHelper => {
  const liveMargin = liveEdgeMargin || defaultLivePositionMargin;

  function calculateNewState(videoElement: HTMLVideoElement, shakaPlayer: ShakaPlayer) {
    const seekRange = shakaPlayer.seekRange();
    const isLive = shakaPlayer.isLive();
    const startDateTime = isLive ? shakaPlayer.getPresentationStartTimeAsDate() : new Date();
    const position = videoElement.currentTime - seekRange.start;
    const duration =
      seekRange.end !== 0 || seekRange.start !== 0
        ? seekRange.end - seekRange.start
        : videoElement.duration === Infinity || videoElement.duration === NaN
          ? 0
          : videoElement.duration;

    const playMode = resolvePlayMode(duration, isLive);
    const isAtLivePosition = isLive && position > duration - liveMargin;

    const { absolutePosition, absoluteStartPosition } = getAbsolutePositions(
      isLive,
      startDateTime,
      seekRange,
      position
    );
    return {
      position,
      duration,
      playMode,
      isAtLivePosition,
      absolutePosition,
      absoluteStartPosition
    };
  }

  function adjustForDvrStartOffset(videoElement: HTMLVideoElement, shakaPlayer: ShakaPlayer) {
    if (videoElement && videoElement.paused && shakaPlayer.isLive()) {
      const seekableStart = shakaPlayer.seekRange().start || 0;
      if (seekableStart >= videoElement.currentTime) {
        videoElement.currentTime = seekableStart + dvrStartCorrection;
      }
    }
  }

  function setPosition(videoElement: HTMLVideoElement, shakaPlayer: ShakaPlayer, newPosition: number) {
    if (!(isNaN(newPosition) && newPosition === Infinity)) {
      videoElement.currentTime = shakaPlayer.seekRange().start + newPosition;
    }
  }

  function gotoLive(videoElement: HTMLVideoElement, shakaPlayer: ShakaPlayer) {
    if (shakaPlayer.isLive()) {
      videoElement.currentTime = shakaPlayer.seekRange().end;
    }
  }

  return {
    adjustForDvrStartOffset,
    calculateNewState,
    setPosition,
    gotoLive
  };
};

export default getStreamRangeHelper;
