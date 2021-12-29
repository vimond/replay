// @flow
import type { Shaka, ShakaPlayer } from './types';
import type { ShakaVideoStreamerConfiguration } from './ShakaVideoStreamer';
import { PlaybackError } from '../types';

export function shakaSetup(
  shakaLib: Shaka,
  videoElement: HTMLVideoElement,
  configuration: ?ShakaVideoStreamerConfiguration
): ShakaPlayer {
  if (!!window.MediaSource && !!MediaSource.isTypeSupported) {
    const shakaPlayer = new shakaLib.Player(videoElement);
    if (configuration && configuration.shakaPlayer) {
      const shakaConf = configuration.shakaPlayer;
      if (shakaConf.installPolyfills) {
        shakaLib.polyfill.installAll();
      } else {
        shakaLib.polyfill.MediaCapabilities.install();
      }
      if (shakaConf.customConfiguration) {
        shakaPlayer.configure(shakaConf.customConfiguration);
      }
    } else {
      shakaLib.polyfill.MediaCapabilities.install();
    }
    const log = shakaLib.log && shakaLib.log;
    const logLevel = configuration && configuration.logLevel;
    if (logLevel != null && log) {
      if (logLevel === 'VERBOSE') {
        log.setLevel(log.Level['V2']);
      } else {
        log.setLevel(log.Level[logLevel]);
      }
    }
    return shakaPlayer;
  } else {
    throw new PlaybackError(
      'STREAM_ERROR_TECHNOLOGY_UNSUPPORTED',
      'shaka',
      'MPEG-DASH playback with Shaka Player is not supported in this browser.'
    );
  }
}

export function shakaCleanup(shakaPlayer: ShakaPlayer) {
  return Promise.resolve(shakaPlayer && shakaPlayer.destroy());
}
