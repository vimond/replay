import * as React from "react";
import { FairPlayRequestFormat, PlayerConfiguration } from './PlayerConfiguration';

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
