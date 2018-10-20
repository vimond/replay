// @flow

// Types for state observation

import type { CommonGenericProps, CommonProps } from '../../common';

export type PlayState = 'inactive' | 'starting' | 'playing' | 'paused' | 'seeking' | 'buffering';
export type PlayMode = 'ondemand' | 'live' | 'livedvr';

export type ErrorCode =
  | 'STREAM_ERROR_DOWNLOAD'
  | 'STREAM_ERROR_DECODE'
  | 'STREAM_ERROR_DRM_OUTPUT_BLOCKED'
  | 'STREAM_ERROR_PLUGIN_UNAVAILABLE'
  | 'PLUGIN_APP_LOAD_ERROR'
  | 'STREAM_ERROR_DRM_CLIENT_UNAVAILABLE'
  | 'STREAM_ERROR';

export type Severity = 'FATAL' | 'WARNING' | 'INFO';

export class PlaybackError extends Error {
  constructor(code: ErrorCode, technology: string, message?: string, severity: Severity = 'FATAL', sourceError?: any) {
    super(message);
    this.code = code;
    this.severity = severity;
    this.technology = technology;
    this.sourceError = sourceError;
  }
  code: ErrorCode;
  severity: Severity;
  technology: string;
  sourceError: any;
}

export type AvailableTrack = {
  kind?: string,
  label?: string,
  language?: string,
  origin?: 'side-loaded' | 'in-stream',
  id?: string | number
};

export type VideoStreamState = {
  isPaused?: boolean,
  isBuffering?: boolean,
  isSeeking?: boolean,
  position?: number,
  duration?: number,
  absolutePosition?: Date,
  absoluteStartPosition?: Date,
  isAtLivePosition?: boolean,
  playState?: PlayState,
  playMode?: PlayMode,
  volume?: number,
  isMuted?: boolean,
  bufferedAhead?: number,
  currentBitrate?: number,
  lockedBitrate?: ?number,
  maxBitrate?: number,
  bitrates?: Array<number>,
  currentTextTrack?: ?AvailableTrack,
  textTracks?: Array<AvailableTrack>,
  currentAudioTrack?: ?AvailableTrack,
  audioTracks?: Array<AvailableTrack>,
  error?: any
};

export type VideoStreamStateKeys = $Keys<VideoStreamState>;
export type VideoStreamStateValues = $Values<VideoStreamState>;

// Types used in settable props.

export type SourceTrack = {
  src: string,
  label?: string,
  kind?: string,
  language?: string,
  contentType?: string,
  cues?: Array<{ start: number, end: number, content: string }>
};

export type PlaybackSource = {
  playbackTechnology?: 'html' | 'shaka-legacy' | 'shaka-player' | 'dash.js' | 'hls.js' | 'silverlight' | 'flash',
  streamUrl: string,
  licenseUrl?: string,
  startPosition?: number,
  isLive?: boolean,
  textTracks?: Array<SourceTrack>,
  metadata?: any,
  licenseRequestDetails?: {
    licenseRequestHeaders?: any,
    fairPlayCertificateUrl?: string,
    widevineServiceCertificateUrl?: string,
    contentId?: any
  }
};

/* Types for settable props */

export type InitialPlaybackProps = {
  isMuted?: boolean,
  volume?: number,
  isPaused?: boolean,
  maxBitrate?: number,
  lockedBitrate?: number | 'max' | 'min'
};

export type PlaybackProps = InitialPlaybackProps & {
  position?: number,
  isAtLivePosition?: true, // TODO: Rename to isPlayingAtLiveEdge.
  selectedTextTrack?: AvailableTrack,
  selectedAudioTrack?: AvailableTrack
};

export type VideoStreamerMethods = {
  setProperty: PlaybackProps => void
};

export type VideoStreamerProps = CommonProps & {
  // configuration?: ?VideoStreamerConfiguration,
  source?: ?PlaybackSource,
  textTracks?: ?Array<SourceTrack>,
  className?: string,
  initialPlaybackProps?: InitialPlaybackProps,
  onReady?: VideoStreamerMethods => void,
  onStreamStateChange?: VideoStreamState => void,
  onProgress?: ({ event: string }) => void,
  onPlaybackError?: PlaybackError => void
};

export type VideoStreamerConfiguration = {
  // TODO: What to include? Try it out.
  licenseAcquisition?: ?{
    widevine: {
      serviceCertificate?: ?string,
      withCredentials?: ?boolean
    },
    fairPlay: {
      serviceCertificate?: ?string,
      withCredentials?: ?boolean
    },
    playReady: {
      withCredentials?: ?boolean
    }
  },
  manifestRequests?: ?{
    withCredentials?: ?boolean
  },
  logLevel?: 'NONE' | 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG', // TODO: Generalise.
  defaultBandwidth?: ?number,
  crossOrigin?: ?string,
  playsInline?: ?boolean,
  liveEdgeMargin?: ?number,
  pauseUpdateInterval?: ?number
};

export type VideoStreamerImplProps<T: VideoStreamerConfiguration> = VideoStreamerProps & CommonGenericProps & {
  configuration?: ?T,
  applyBuiltInStyles?: boolean
};
