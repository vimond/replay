// @flow

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

export type ShakaRequestFilter = (type: string, request: ShakaRequest) => Promise<void> | void;
export type ShakaResponseFilter = (type: string, response: ShakaResponse) => Promise<void> | void;

export type ShakaError = { code: number, category: number, data: any, message: ?string };

export type ShakaTrack = {
  id: number,
  active: boolean,
  type: string,
  bandwidth: number,
  language: string,
  label: ?string,
  roles: Array<string>,
  kind: ?string,
  mimeType: ?string
};

export type ShakaLanguageRole = {
  language: string,
  role: string
};

export type ShakaPlayer = {
  addEventListener: (name: string, handler: (any) => void) => void,
  addTextTrack: (
    uri: string,
    language: ?string,
    kind: ?string,
    mime: ?string,
    codec?: ?string,
    label?: string
  ) => Promise<ShakaTrack>,
  cancelTrickPlay: () => void,
  configure: any => void,
  destroy: () => Promise<void>,
  getAudioLanguagesAndRoles: () => Array<{ language: string, role: string }>,
  getConfiguration: () => { [string]: any },
  getNetworkingEngine: () => {
    clearAllRequestFilters: () => void,
    clearAllResponseFilters: () => void,
    registerRequestFilter: ShakaRequestFilter => void,
    registerResponseFilter: ShakaResponseFilter => void
  },
  getPlaybackRate: () => number,
  getPresentationStartTimeAsDate: () => Date,
  getTextTracks: () => Array<ShakaTrack>,
  getVariantTracks: () => Array<ShakaTrack>,
  isLive: () => boolean,
  isTextTrackVisible: () => boolean,
  load: (assetUri: string, startPosition?: number) => Promise<void>,
  removeEventListener: (name: string, handler: (any) => void) => void,
  seekRange: () => { start: number, end: number },
  selectAudioLanguage: (language: string, role?: string) => void,
  selectTextTrack: ShakaTrack => void,
  selectVariantTrack: (track: ShakaTrack, clearBuffer?: boolean, safeMargin?: number) => void,
  setTextTrackVisibility: boolean => void,
  trickPlay: number => void,
  unload: (reinitializeMediaSource?: boolean) => Promise<void>,
  version: string
};


export interface Error {
  Category: { [string]: string };
  Code: { [string]: string };
}

type LogLevels = 'NONE' | 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG' | 'V1' | 'V2';

export interface LogLevel {
  [LogLevels]: number;
}

export interface Shaka {
  polyfill: {
    installAll: () => {}
  };
  util: {
    Error: Error
  };
  net: {
    NetworkingEngine: {
      RequestType: { [string]: string }
    }
  };
  log?: {
    setLevel: number => {},
    Level: LogLevel
  };
  Player: HTMLVideoElement => ShakaPlayer;
}
