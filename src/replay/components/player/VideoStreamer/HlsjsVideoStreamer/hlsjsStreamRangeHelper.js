// @flow
import type { PlayMode } from '../types';
import Hls from 'hls.js';
import type { StreamRangeHelper } from '../common/types';
import type { HlsjsInstanceKeeper } from './HlsjsVideoStreamer';

const dawnOfTime = new Date(0);
const minimumDvrLength = 100; // seconds
const defaultLivePositionMargin = 10; // seconds

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

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
  startDateTime: ?Date,
  position: number
): { absolutePosition: Date, absoluteStartPosition: Date } {
  if (isLive) {
    if (startDateTime == null || typeof startDateTime !== Date || isNaN(startDateTime)) {
      const absolutePosition = new Date();
      const absoluteStartPosition = new Date(absolutePosition.getTime() - position * 1000);
      return {
        absolutePosition,
        absoluteStartPosition
      };
    } else {
      return {
        absolutePosition: new Date(startDateTime.getTime() + position * 1000),
        absoluteStartPosition: startDateTime
      };
    }
  } else {
    return {
      absolutePosition: dawnOfTime,
      absoluteStartPosition: dawnOfTime
    };
  }
}

function getIsAtLivePosition(hls, videoElement, isLive, liveMargin) {
  if (isLive) {
    if (hls.liveSyncPosition) {
      return videoElement.currentTime > hls.liveSyncPosition - liveMargin;
    } else if (hls.config && hls.config.liveSyncDuration) {
      return videoElement.currentTime > videoElement.duration - (hls.config.liveSyncDuration + liveMargin);
    } else if (hls.config && hls.config.liveSyncDurationCount) {
      return videoElement.currentTime > videoElement.duration - ((hls.config.liveSyncDurationCount * 10) + liveMargin);
    } else {
      return false;
    }
  } else {
    return false;
  }
}

const getStreamRangeHelper = (
  videoElement: HTMLVideoElement,
  instanceKeeper: HlsjsInstanceKeeper,
  configuration: ?{ liveEdgeMargin?: ?number }
): StreamRangeHelper => {
  const liveMargin = (configuration && configuration.liveEdgeMargin) || defaultLivePositionMargin;
  let levelDuration = 0;
  let streamStartDate: ?Date;
  let isLive = false;
  let hls;

  function calculateNewState() {
    let position;
    
    if (levelDuration) {
      position = Math.max((videoElement.currentTime || 0) - Math.max(videoElement.duration - levelDuration, 0), 0);
    } else {
      position = videoElement.currentTime || 0;
    }
    const duration = levelDuration || videoElement.duration;
    const { absolutePosition, absoluteStartPosition } = getAbsolutePositions(isLive, streamStartDate, position);
    const playMode = resolvePlayMode(duration, isLive);
    const isAtLivePosition = hls && getIsAtLivePosition(hls, videoElement, isLive, liveMargin);

    return {
      position,
      duration,
      playMode,
      isAtLivePosition,
      absolutePosition,
      absoluteStartPosition
    };
  }

  function adjustForDvrStartOffset() {
    /* Handled by hls.js itself? */
  }

  function setPosition(newPosition: number) {
    if (!(isNaN(newPosition) && newPosition === Infinity)) {
      if (levelDuration) {
        videoElement.currentTime = newPosition + videoElement.duration - levelDuration;
      } else {
        videoElement.currentTime = newPosition;
      }
    }
  }

  function gotoLive() {
    if (isLive && hls) {
      if (hls.liveSyncPosition) {
        videoElement.currentTime = hls.liveSyncPosition;
      } else if (hls.config && hls.config.liveSyncDuration) {
        videoElement.currentTime = videoElement.duration - (hls.config.liveSyncDuration + liveMargin);
      } else if (hls.config && hls.config.liveSyncDurationCount) {
        videoElement.currentTime = videoElement.duration - ((hls.config.liveSyncDurationCount * 10) + liveMargin);
      } else {
        videoElement.currentTime = videoElement.duration - liveMargin;
      }
    }
  }

  function reset() {
    streamStartDate = null;
    levelDuration = 0;
    isLive = false;
  }

  const hlsjsEventHandlers = {
    [Hls.Events.MANIFEST_LOADING]: () => reset,
    [Hls.Events.LEVEL_LOADED]: (evt, data) => {
      isLive = data.details.live;
      levelDuration = data.details.totalduration;
      // updateDuration();
      const programDateTime =
        data.details &&
        data.details.fragments &&
        data.details.fragments[0] &&
        data.details.fragments[0].programDateTime;
      if (programDateTime) {
        streamStartDate = new Date(programDateTime);
        // updatePosition();
      }
    },
    // [Hls.Events.ERROR]: () => reset // TODO: Is this needed?
  };

  function onHlsInstance(hlsInstance, preposition) {
    Object.entries(hlsjsEventHandlers).forEach(([name, handler]) => {
      // $FlowFixMe
      hlsInstance[preposition](name, handler);
      if (preposition === 'on') {
        hls = hlsInstance;
      }
    });
  }
  
  instanceKeeper.subscribers.push(onHlsInstance);

  return {
    adjustForDvrStartOffset,
    calculateNewState,
    setPosition,
    gotoLive
  };
};

export default getStreamRangeHelper;
