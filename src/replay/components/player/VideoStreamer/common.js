// Types for state observation

import type { CommonProps } from '../../common';

export type PlayState = 'inactive' | 'starting' | 'playing' | 'paused' | 'seeking' | 'buffering';
export type PlayMode = 'ondemand' | 'live' | 'livedvr';

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
  currentTextTrack?: AvailableTrack,
  textTracks?: Array<AvailableTrack>,
  currentAudioTrack?: AvailableTrack,
  audioTracks?: Array<AvailableTrack>,
  error?: any
};

// Types used in settable props.

export type VideoStreamerConfiguration = {
  dash?: any,
  html?: any,
  silverlight?: any
} | any;

export type SourceTrack = {
  src: string,
  label?: string,
  kind?: string,
  language?: string,
  contentType?: string,
  isDefault: boolean
};

export type PlaybackSource = {
  playbackTechnology: 'html' | 'shaka-legacy' | 'shaka-player' | 'dash.js' | 'hls.js' | 'silverlight' | 'flash',
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

export type PlaybackProps = {
  volume?: number,
  isMuted?: boolean,
  isPaused?: boolean,
  maxBitrate?: number,
  lockedBitrate?: number | string,
  selectedTextTrack?: AvailableTrack,
  selectedAudioTrack?: AvailableTrack
};

export type PlaybackMethods = {
  updateProperty: (property: PlaybackProps) => void,
  setPosition: (value: number) => void,
  gotoLive: () => void
};

export type VideoStreamerProps = PlaybackProps & CommonProps & {
  configuration?: VideoStreamerConfiguration,
  source?: PlaybackSource,
  textTracks?: Array<SourceTrack>,
  className?: string,

  onReady?: PlaybackMethods => void,
  onStreamStateChange?: VideoStreamState => void,
  onProgress?: ({ event: string }) => void,
  onPlaybackError?: Error => void
};

export type PlaybackApi = PlaybackMethods & VideoStreamState;
