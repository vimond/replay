// @flow

import { PlayState, PlayMode } from '../VideoStreamer/common';
import { prefixClassNames } from '../../common';

type ClassNameKeys =
  | 'isBuffering'
  | 'isStarting'
  | 'isPlaying'
  | 'isPaused'
  | 'isSeeking'
  | 'isMuted'
  | 'isAtLivePosition'
  | 'isLive'
  | 'isOnDemand'
  | 'isDvrEnabled'
  | 'isFailed'
  | 'isFullscreen'
  | 'isUserActive'
  | 'isUserInactive'
  | 'responsivenessPrefix'
  | 'volumePrefix';

export type RecognizedPlayerStateProperties = {
  isPaused?: boolean,
  isSeeking?: boolean,
  isBuffering?: boolean,
  isMuted?: boolean,
  volume?: number,
  isAtLivePosition?: boolean,
  playState?: PlayState,
  playMode?: PlayMode,
  error?: any,
  isUserActive?: boolean,
  isFullscreen?: boolean,
  responsivenessRanges?: Array<string>
};

const volumeMappings = ['low', 'medium', 'high'];

const isStreamOpen = (playState: PlayState) => playState && playState !== 'inactive' && playState !== 'starting';

// TODO: This needs to be memoized!
const getPlayerStateClassNames = (
  {
    isPaused,
    isSeeking,
    isBuffering,
    isMuted,
    volume,
    isAtLivePosition,
    playState,
    playMode,
    error,
    isUserActive,
    isFullscreen,
    responsivenessRanges
  }: RecognizedPlayerStateProperties,
  classNameDefinitions: { [ClassNameKeys]: string },
  classNamePrefix?: string,
  extraClassNames?: Array<string> = []
): string => {
  const cd = classNameDefinitions || {};
  const resultingClassNames = [];

  // Is paused, playing
  if (isStreamOpen(playState) && isPaused != null) {
    if (isPaused) {
      resultingClassNames.push(cd.isPaused);
    } else {
      resultingClassNames.push(cd.isPlaying);
    }
  }
  if (isBuffering) {
    resultingClassNames.push(cd.isBuffering);
  }
  if (isSeeking) {
    resultingClassNames.push(cd.isSeeking);
  }
  if (isMuted) {
    resultingClassNames.push(cd.isMuted);
  }
  if (isAtLivePosition) {
    resultingClassNames.push(cd.isAtLivePosition);
  }
  if (playState === 'starting') {
    resultingClassNames.push(cd.isStarting);
  }
  if (playMode === 'ondemand') {
    resultingClassNames.push(cd.isOnDemand);
  } else if (playMode === 'live') {
    resultingClassNames.push(cd.isLive);
  } else if (playMode === 'livedvr') {
    resultingClassNames.push(cd.isLive);
    resultingClassNames.push(cd.isDvrEnabled);
  }
  if (volume != null && cd.volumePrefix != null) {
    const i = Math.min(Math.floor(volume * volumeMappings.length), volumeMappings.length - 1);
    resultingClassNames.push(cd.volumePrefix + volumeMappings[i]);
  }
  if (isFullscreen) {
    resultingClassNames.push(cd.isFullscreen);
  }
  if (isUserActive != null) {
    if (isUserActive) {
      resultingClassNames.push(cd.isUserActive);
    } else {
      resultingClassNames.push(cd.isUserInactive);
    }
  }
  if (Array.isArray(responsivenessRanges) && cd.responsivenessPrefix != null) {
    responsivenessRanges.forEach(r => resultingClassNames.push(cd.responsivenessPrefix + r));
  }
  if (error) {
    resultingClassNames.push(cd.isFailed);
  }
  return prefixClassNames(classNamePrefix, ...resultingClassNames.concat(extraClassNames));
};

export default getPlayerStateClassNames;
