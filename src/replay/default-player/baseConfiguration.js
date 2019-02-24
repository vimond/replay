// @flow

import type { PlayerConfiguration } from './types';

export const baseConfiguration: PlayerConfiguration = {
  videoStreamer: {
    logLevel: 'WARNING'
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
  responsivenessRules: [
    {
      className: 'narrow',
      width: {
        max: 500
      }
    },
    {
      className: 'medium-width',
      width: {
        min: 500,
        max: 1000
      }
    },
    {
      className: 'wide',
      width: {
        min: 1000
      }
    }
  ],
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
  controls: {
    skipButtonOffset: -10,
    qualitySelectionStrategy: 'cap-bitrate',
    liveDisplayMode: 'clock-time'
  },
  playbackMonitor: {
    visibleAtStart: false
  }
};
