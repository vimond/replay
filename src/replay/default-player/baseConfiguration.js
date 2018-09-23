// @flow

import type { PlayerConfiguration } from './types';

export const baseConfiguration: PlayerConfiguration = {
  videoStreamer: {
    dash: {
      shaka: {
        logLevel: 'ERROR'
      }
    },
    logging: {
      global: 'WARN'
    }
  },
  interactionDetector: {
    inactivityDelay: 2
  },
  keyboardShortcuts: {
    keyCodes: {
      togglePause: [32, 13],
      toggleFullscreen: 70,
      decreaseVolume: [109, 189],
      increaseVolume: [107, 187],
      skipBack: 188,
      skipForward: 190,
      toggleUserActive: 67,
      toggleMute: 77
    }
  },
  userSettings: {
    hasPrecedence: true,
    storageKey: 'replay-settings',
    settingsStoragePolicy: {
      volume: 'local',
      isMuted: 'local',
      textTrackLanguage: 'local',
      textTrackKind: 'local',
      audioTrackLanguage: 'local',
      audioTrackKind: 'local'
    }
  },
  ui: {
    skipButtonOffset: -10,
    qualitySelectionStrategy: 'cap-bitrate',
    liveDisplayMode: 'clock-time'
  },
  playbackMonitor: {
    visibleAtStart: false
  }
};
