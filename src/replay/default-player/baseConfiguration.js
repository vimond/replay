// @flow

import type { PlayerConfiguration } from './types';

export const baseConfiguration = {
  keyboardShortcuts: {
    keyCodes: {
      togglePause: [32, 13],
      toggleFullscreen: 70,
      decreaseVolume: [109, 189],
      increaseVolume: [107, 187],
      skipBack: 188,
      skipForward: 190,
      toggleMute: 77
    }
  },
  videoStreamer: {},
  ui: {
    skipButtonOffset: -10,
    qualitySelectionStrategy: 'cap-bitrate',
    liveDisplayMode: 'clock-time'
  },
  playbackMonitor: {
    startVisible: false
  }
};

export const getSkipBackOffset = (conf: PlayerConfiguration) => conf && conf.ui && conf.ui.skipButtonOffset;

export const getLiveDisplayMode = (conf: PlayerConfiguration) => conf && conf.ui && conf.ui.liveDisplayMode;

export const getQualitySelectionStrategy = (conf: PlayerConfiguration) =>
  conf && conf.ui && conf.ui.qualitySelectionStrategy;
