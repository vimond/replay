// @flow
import type { VideoStreamerConfiguration } from '../types';

export type ShakaRequest = {
  uris: Array<string>,
  method: string,
  body: ArrayBuffer,
  headers: { [string]: string },
  allowCrossSiteCredentials: boolean,
  retryParameters: {
    maxAttempts: number,
    baseDelay: number,
    backoffFactor: number,
    fuzzFactor: number,
    timeout: number
  }
};

export type ShakaResponse = {
  uri: string, 
  data: ArrayBuffer, 
  headers: { [string]: string }, 
  timeMs?: number, 
  fromCache?: boolean
};

export type ShakaRequestFilter = (type: string, request: ShakaRequest) => (Promise<void> | void);
export type ShakaResponseFilter = (type: string, response: ShakaResponse) => (Promise<void> | void);

export type ShakaTrack = {
  id: number,
  active: boolean,
  type: string,
  bandwidth: number,
  language: string,
  label: ?string,
  kind: ?string,
  mimeType: ?string
};

export type ShakaPlayer = {
  addTextTrack: (uri: string, language: string, kind: string, mime: string, codec?: string, label?: string) => Promise<ShakaTrack>;
  cancelTrickPlay: () => void,
  configure: any => void,
  destroy: () => Promise<void>,
  getAudioLanguagesAndRoles: () => Array<{ language: string, role: string }>,
  getNetworkingEngine: () => {
    clearAllRequestFilters: () => void,
    clearAllResponseFilters: () => void,
    registerRequestFilter: ShakaRequestFilter => void,
    registerResponseFilter: ShakaResponseFilter => void
  };
  getPlaybackRate: () => number,
  getPresentationStartTimeAsDate: () => Date,
  getTextTracks: () => Array<ShakaTrack>,
  getVariantTracks: () => Array<ShakaTrack>,
  isLive: () => boolean,
  isTextTrackVisible: () => boolean,
  load: (assetUri: string, startPosition?: number) => Promise<void>,
  seekRange: () => { start: number, end: number },
  selectAudioLanguage: (language: string, role?: string) => void,
  selectTextTrack: ShakaTrack => void,
  selectVariantTrack: (track: ShakaTrack, clearBuffer?: boolean, safeMargin?: number) => void,
  setTextTrackVisibility: boolean => void,
  trickPlay: number => void,
  unload: (reinitializeMediaSource?: boolean) => Promise<void>,
  version: string
};

export type ShakaVideoStreamerConfiguration = VideoStreamerConfiguration & {
  shakaPlayer?: {
    installPolyfills?: boolean,
    playerConfiguration?: any // Actually the config structure that can be passed to shaka.Player::configure.
  } 
};