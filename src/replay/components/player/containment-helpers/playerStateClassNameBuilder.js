// @flow

import { type PlayState, type PlayMode } from '../VideoStreamer/types';
import { prefixClassNames } from '../../common';

export type ClassNameKeys =
  | 'isBuffering'
  | 'isStarting'
  | 'isPlaying'
  | 'isPaused'
  | 'isSeeking'
  | 'isMuted'
  | 'isAtLiveEdge'
  | 'isLive'
  | 'isOnDemand'
  | 'isDvrEnabled'
  | 'isFailed'
  | 'isFullscreen'
  | 'isUserActive'
  | 'isUserInactive'
  | 'volumePrefix';

export type RecognizedPlayerStateProperties = {
  isPaused?: boolean,
  isSeeking?: boolean,
  isBuffering?: boolean,
  isMuted?: boolean,
  volume?: number,
  isAtLiveEdge?: boolean,
  playState?: PlayState,
  playMode?: PlayMode,
  error?: any,
  isUserActive?: boolean,
  isFullscreen?: boolean
};

const volumeMappings = ['low', 'medium', 'high'];

const isStreamOpen = (playState?: PlayState) => playState && playState !== 'inactive' && playState !== 'starting';

const playerStateClassNameBuilder = (
  {
    isPaused,
    isSeeking,
    isBuffering,
    isMuted,
    volume,
    isAtLiveEdge,
    playState,
    playMode,
    error,
    isUserActive,
    isFullscreen
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
  if (isAtLiveEdge) {
    resultingClassNames.push(cd.isAtLiveEdge);
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
  if (error) {
    resultingClassNames.push(cd.isFailed);
  }
  return prefixClassNames(classNamePrefix, ...resultingClassNames.concat(extraClassNames));
};

export default playerStateClassNameBuilder;
