export type FairPlayRequestFormat = 'formdata' | 'binary' | 'base64';

export interface VideoStreamerConfiguration {
  licenseAcquisition?: {
    widevine: {
      serviceCertificateUrl?: string | null,
      withCredentials?: boolean | null
    },
    fairPlay: {
      serviceCertificateUrl?: string | null,
      withCredentials?: boolean | null,
      requestFormat?: FairPlayRequestFormat | null,
      contentIdExtractMatch?: RegExp | string | null
    },
    playReady: {
      withCredentials?: boolean | null
    }
  } | null,
  manifestRequests?: {
    withCredentials?: boolean | null
  } | null,
  logLevel?: 'NONE' | 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG',
  defaultBandwidth?: number | null,
  crossOrigin?: string | null,
  playsInline?: boolean | null,
  liveEdgeMargin?: number | null,
  pauseUpdateInterval?: number | null
}

export interface InteractionDetectorConfiguration {
  inactivityDelay: number
}

export type KeyMapping = string | string[];

export interface KeyboardShortcutsConfiguration {
  keyMap: {
    togglePause?: KeyMapping,
    toggleMute?: KeyMapping,
    toggleFullscreen?: KeyMapping,
    skipBack?: KeyMapping,
    skipForward?: KeyMapping,
    increaseVolume?: KeyMapping,
    decreaseVolume?: KeyMapping
  },
  volumeStep?: number,
  skipOffset?: number
}

export type SettingsStorageKind = 'none' | 'local' | 'session' | null;

export interface UserSettingsConfiguration {
  userSettings?: {
    hasPrecedence?: boolean | null,
    storageKey?: string,
    settingsStoragePolicy: {
      volume?: SettingsStorageKind,
      isMuted?: SettingsStorageKind,
      textTrackLanguage?: SettingsStorageKind,
      textTrackKind?: SettingsStorageKind,
      audioTrackLanguage?: SettingsStorageKind,
      audioTrackKind?: SettingsStorageKind
    }
  }
}

export interface ResponsiveRange {
  className: string,
  width?: {
    min?: number | null,
    max?: number | null
  },
  height?: {
    min?: number | null,
    max?: number | null
  }
}

export type ControlNames =
  | 'playPauseButton'
  | 'skipButton'
  | 'timeline'
  | 'timeDisplay'
  | 'gotoLiveButton'
  | 'volume'
  | 'audioSelector'
  | 'subtitlesSelector'
  | 'qualitySelector'
  | 'airPlayButton'
  | 'pipButton'
  | 'fullscreenButton'
  | 'exitButton'
  | 'playbackMonitor'
  | 'bufferingIndicator';

export interface PlayerConfiguration {
  videoStreamer?: VideoStreamerConfiguration | null,
  interactionDetector?: InteractionDetectorConfiguration | null,
  keyboardShortcuts?: KeyboardShortcutsConfiguration | null,
  userSettings?: UserSettingsConfiguration | null,
  responsivenessRules?: ResponsiveRange[] | null,
  classNamePrefix?: string | null,
  controls?: {
    includeControls?: ControlNames[] | null,
    skipButtonOffset?: number,
    liveDisplayMode?: 'clock-time' | 'live-offset',
    qualitySelectionStrategy?: 'cap-bitrate' | 'fix-bitrate'
  } | null
}
