// @flow
import type { PlayMode, VideoStreamState } from '../types';

export type StreamRangeHelper = {
  adjustForDvrStartOffset: HTMLVideoElement => void,
  calculateNewState: HTMLVideoElement => VideoStreamState,
  setPosition: (HTMLVideoElement, number) => void,
  gotoLive: HTMLVideoElement => void
};

const dawnOfTime = new Date(0);
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

const getStreamRangeHelper = (livePositionMargin: number = defaultLivePositionMargin): StreamRangeHelper => {
  function calculateNewState(videoElement: HTMLVideoElement) {
    const seekableRange = getSeekableNetRange(videoElement);
    const isLive = videoElement.duration === Infinity;

    const position = getPosition(videoElement);
    const duration = getDuration(videoElement, isLive, seekableRange);
    const playMode = resolvePlayMode(videoElement, seekableRange, isLive);
    const isAtLivePosition = isLive && position > duration - livePositionMargin;
    const { absolutePosition, absoluteStartPosition } = getAbsolutePositions(videoElement, isLive, position);
    return {
      position,
      duration,
      playMode,
      isAtLivePosition,
      absolutePosition,
      absoluteStartPosition
    };
  }

  function adjustForDvrStartOffset(videoElement) {
    if (videoElement && videoElement.paused && videoElement.duration === Infinity) {
      const seekableStart = getStartOffset(videoElement);
      if (seekableStart !== Infinity && seekableStart >= videoElement.currentTime) {
        videoElement.currentTime = seekableStart + dvrStartCorrection;
      }
    }
  }

  function setPosition(videoElement: HTMLVideoElement, newPosition: number) {
    if (!(isNaN(newPosition) && newPosition === Infinity)) {
      videoElement.currentTime = getStartOffset(videoElement) + newPosition;
    }
  }

  function gotoLive(videoElement: HTMLVideoElement) {
    if (videoElement.duration === Infinity && videoElement.seekable.length > 0) {
      videoElement.currentTime = videoElement.seekable.end(0);
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
