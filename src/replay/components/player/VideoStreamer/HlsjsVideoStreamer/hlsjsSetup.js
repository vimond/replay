// @flow
import Hls from 'hls.js';
import type { HlsjsInstanceKeeper, HlsjsVideoStreamerConfiguration } from './HlsjsVideoStreamer';
import type { AdvancedPlaybackSource } from '../types';
import { PlaybackError } from '../types';

export function broadcastHlsInstance(instanceKeeper: HlsjsInstanceKeeper, preposition: 'on' | 'off') {
  const { hls } = instanceKeeper;
  hls && instanceKeeper.subscribers.forEach(subscriber => subscriber(hls, preposition));
}

const debugEnabledLogLevels = ['DEBUG', 'VERBOSE', 'INFO'];

export function hlsjsSetup(
  videoElement: HTMLVideoElement,
  normalizedSource: ?AdvancedPlaybackSource,
  configuration: ?HlsjsVideoStreamerConfiguration
): Promise<Hls> {
  return new Promise((resolve, reject) => {
    if (Hls.isSupported()) {
      const customConfiguration = configuration && configuration.hlsjs && configuration.hlsjs.customConfiguration;
      const hlsConfig: any = {
        autoStartLoad: false,
        debug: configuration && debugEnabledLogLevels.indexOf(configuration.logLevel) >= 0,
        ...customConfiguration
      };

      const licenseUrl = normalizedSource && normalizedSource.licenseUrl;
      if (licenseUrl) {
        hlsConfig.widevineLicenseUrl = licenseUrl;
        hlsConfig.emeEnabled = true;
        const drmDetails = normalizedSource && normalizedSource.licenseAcquisitionDetails;
        if (drmDetails && drmDetails.robustness && drmDetails.robustness['com.widevine.alpha']) {
          const { audio, video } = drmDetails.robustness['com.widevine.alpha'];
          hlsConfig.drmSystemOptions = {
            audioRobustness: audio,
            videoRobustness: video
          };
        }
      }

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

export function hlsjsCleanup(instanceKeeper: HlsjsInstanceKeeper) {
  const { hls } = instanceKeeper;
  if (hls) {
    hls.stopLoad();
    broadcastHlsInstance(instanceKeeper, 'off');
    return Promise.resolve(hls.destroy());
  } else {
    return Promise.resolve();
  }
}
