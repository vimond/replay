declare module 'hls.js' {
  declare export type HlsjsAudioTrack = {
    id: number,
    lang: string,
    name: string,
    groupId: string
  };

  declare export type HlsjsQualityLevel = {
    bitrate: number
  };

  declare export type HlsjsErrorData = {
    type: string,
    details: string,
    reason: any,
    fatal: boolean,
    url: ?string
  };

  declare class Hls {
    constructor(configuration: any): Hls;
    static ErrorDetails: any;
    static ErrorTypes: any;
    static Events: any;
    static version: string;
    static isSupported(): boolean;
    attachMedia(HTMLVideoElement): void;
    destroy(): void;
    detachMedia(): void;
    audioTrack: number;
    audioTracks: Array<HlsjsAudioTrack>;
    autoLevelCapping: number;
    autoLevelEnabled: boolean;
    config: {
      liveSyncDuration?: number,
      liveSyncDurationCount?: number
    };
    currentLevel: number; //TODO: Is this actually fixing the bitrate?
    firstLevel: number;
    levels: Array<HlsjsQualityLevel>;
    liveSyncPosition?: number;
    liveSyncDuration?: number;
    liveSyncDurationCount?: number;
    loadSource(string): void;
    nextLevel: number;
    off(string, (any) => void): void;
    on(string, (any) => void): void;
    startLevel: number;
    startLoad(?number): void;
    stopLoad(): void;
    url: string;
  }
  declare export default typeof Hls;
}
