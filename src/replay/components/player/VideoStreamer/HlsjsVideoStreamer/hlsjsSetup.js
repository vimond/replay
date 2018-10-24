// @flow
import Hls from 'hls.js';
import type { HlsjsVideoStreamerConfiguration } from './HlsjsVideoStreamer';
import { PlaybackError } from '../types';

export function hlsjsSetup(
  videoElement: HTMLVideoElement,
  configuration: ?HlsjsVideoStreamerConfiguration
): Promise<Hls> {
  return new Promise((resolve, reject) => {
    if (Hls.isSupported()) {
      const customConfiguration = configuration && configuration.hlsjs && configuration.hlsjs.customConfiguration;
      const hlsConfig: any = {
        autoStartLoad: false,
        debug: configuration && configuration.logLevel === 'DEBUG',
        ...customConfiguration
      };
      const hls = new Hls(hlsConfig);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        resolve(hls);
      });
      hls.attachMedia(videoElement);
    } else {
      reject(
        new PlaybackError('STREAM_ERROR_TECHNOLOGY_UNSUPPORTED', 'hlsjs', 'Hls.js is not supported in this browser.')
      );
    }
  });
}

export function hlsjsCleanup(hls: Hls) {
  return Promise.resolve(hls && hls.destroy());
}
