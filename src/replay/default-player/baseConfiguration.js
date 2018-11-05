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
    keyMap: {
      togglePause: [' ', 'Enter', 'P'],
      toggleFullscreen: 'F',
      decreaseVolume: '-',
      increaseVolume: '+',
      skipBack: ',',
      skipForward: '.',
      toggleUserActive: 'C',
      toggleMute: 'M'
    }
  },
  userSettings: {
    hasPrecedence: false,
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
