// @flow
import type { StreamRangeHelper } from '../common/types';

const dawnOfTime = new Date(0);
const minimumDvrLength = 100; // seconds
const defaultLiveEdgeMargin = 10; // seconds
const dvrStartCorrection = 10; // yep, seconds

const getStreamRangeHelper = (rxPlayer: any, configuration: ?{ liveEdgeMargin?: ?number }): StreamRangeHelper => {
  const liveMargin = (configuration && configuration.liveEdgeMargin) || defaultLiveEdgeMargin;

  function calculateNewState() {
    const isLive = rxPlayer.isLive();
    const position = isLive ? rxPlayer.getPosition() - rxPlayer.getMinimumPosition() : rxPlayer.getPosition();
    const duration = isLive
      ? rxPlayer.getMaximumPosition() - rxPlayer.getMinimumPosition()
      : rxPlayer.getVideoDuration();
    const playMode = isLive ? (duration > minimumDvrLength ? 'livedvr' : 'live') : 'ondemand';
    const isAtLiveEdge = isLive && rxPlayer.getPosition() > rxPlayer.getMaximumPosition() - liveMargin;
    const absolutePosition = isLive ? new Date(rxPlayer.getWallClockTime() * 1000) : dawnOfTime;
    const absoluteStartPosition = isLive ? new Date((rxPlayer.getWallClockTime() - position) * 1000) : dawnOfTime;
    return {
      position,
      duration,
      playMode,
      isAtLiveEdge,
      absolutePosition,
      absoluteStartPosition
    };
  }

  function adjustForDvrStartOffset() {
    if (rxPlayer.isLive() && rxPlayer.getPlayerState() === 'PAUSED') {
      if (rxPlayer.getMinimumPosition() >= rxPlayer.getPosition()) {
        rxPlayer.seekTo(rxPlayer.getMinimumPosition() + dvrStartCorrection);
      }
    }
  }

  function setPosition(relativePosition: number) {
    if (rxPlayer.getPlayerState() !== 'RELOADING' && !(isNaN(relativePosition) && relativePosition === Infinity)) {
      rxPlayer.seekTo((rxPlayer.getMinimumPosition() || 0) + relativePosition);
    }
  }

  function gotoLive() {
    if (rxPlayer.isLive()) {
      rxPlayer.seekTo(rxPlayer.getMaximumPosition());
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
