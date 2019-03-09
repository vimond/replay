import * as React from "react";

export type FairPlayRequestFormat = 'formdata' | 'binary' | 'base64';

export interface AdvancedPlaybackSource {
  streamUrl: string,
  contentType?: string,
  licenseUrl?: string,
  drmType?: string,
  startPosition?: number,
  isLive?: boolean,
  textTracks?: SourceTrack[],
  metadata?: any,
  licenseAcquisitionDetails?: {
    licenseRequestHeaders?: { [key: string]: string },
    fairPlayCertificateUrl?: string,
    widevineServiceCertificateUrl?: string,
    fairPlayRequestFormat?: FairPlayRequestFormat,
    contentIdExtractMatch?: RegExp | string,
    contentId?: string
  }
}

export type PlaybackSource = string | AdvancedPlaybackSource;

export interface SourceTrack {
  src: string,
  label?: string,
  kind?: string,
  language?: string,
  contentType?: string,
  cues?: { start: number, end: number, content: string }[]
}

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

export interface AvailableTrack {
  kind?: string,
  label?: string,
  language?: string,
  origin?: 'side-loaded' | 'in-stream',
  id?: string | number
}

export interface PlaybackActions {
  play: () => void,
  pause: () => void,
  setPosition: (position: number) => void,
  gotoLive: () => void,
  setVolume: (volume: number) => void,
  setIsMuted: (isMuted: boolean) => void,
  mute: () => void,
  unmute: () => void,
  requestPictureInPicture: () => void,
  exitPictureInPicture: () => void,
  showAirPlayTargetPicker: () => void,
  setSelectedAudioTrack: (audioTrack: AvailableTrack) => void,
  setSelectedTextTrack: (textTrack: AvailableTrack | null) => void,
  capBitrate: (bitrateCap: number) => void,
  fixBitrate: (bitrateFix: number | 'max' | 'min') => void,
  inspect: () => VideoStreamState,
  setProperties: (properties: PlaybackProps) => void
}

export type PlayState = 'inactive' | 'starting' | 'playing' | 'paused' | 'seeking' | 'buffering';
export type PlayMode = 'ondemand' | 'live' | 'livedvr';

export interface VideoStreamState {
  isPaused?: boolean,
  isBuffering?: boolean,
  isSeeking?: boolean,
  position?: number,
  duration?: number,
  absolutePosition?: Date,
  absoluteStartPosition?: Date,
  isAtLiveEdge?: boolean,
  playState?: PlayState,
  playMode?: PlayMode,
  volume?: number,
  isMuted?: boolean,
  isPipAvailable?: boolean,
  isPipActive?: boolean,
  isAirPlayAvailable?: boolean,
  isAirPlayActive?: boolean,
  bufferedAhead?: number,
  currentBitrate?: number,
  bitrateFix?: number | null,
  bitrateCap?: number | null,
  bitrates?: number[],
  currentTextTrack?: AvailableTrack | null,
  textTracks?: AvailableTrack[],
  currentAudioTrack?: AvailableTrack | null,
  audioTracks?: AvailableTrack[],
  error?: any
}

export interface InitialPlaybackProps {
  isMuted?: boolean,
  volume?: number,
  isPaused?: boolean,
  bitrateCap?: number,
  bitrateFix?: number | 'max' | 'min'
}

export interface PlaybackProps extends InitialPlaybackProps {
  position?: number,
  isAtLiveEdge?: true,
  isPipActive?: boolean,
  isAirPlayTargetPickerVisible?: true,
  selectedTextTrack?: AvailableTrack | null,
  selectedAudioTrack?: AvailableTrack
}

export interface PreferredSettings {
  volume?: number | null,
  isMuted?: boolean | null,
  textTrackLanguage?: string | null,
  textTrackKind?: string | null,
  audioTrackLanguage?: string | null,
  audioTrackKind?: string | null
}

export interface ReplayProps {
  source?: PlaybackSource | null,
  textTracks?: SourceTrack[] | null,
  options?: PlayerConfiguration,
  onExit?: () => void,
  onError?: (error: any) => void,
  onPlaybackActionsReady?: (actions: PlaybackActions) => void,
  onStreamStateChange?: (changedState: VideoStreamState) => void,
  children?: React.Element,
  initialPlaybackProps?: InitialPlaybackProps,
  preferredSettings?: PreferredSettings
}

declare class Replay extends React.Component<ReplayProps, any> {}

export default Replay;
