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
    const shakaPlayerConfig = configuration && configuration.shakaPlayer;
    if (shakaPlayerConfig && shakaPlayerConfig.installPolyfills) {
      shakaLib.polyfill.installAll();
    }
    const shakaPlayer = new shakaLib.Player(videoElement);
    if (shakaPlayerConfig && shakaPlayerConfig.customConfiguration) {
      shakaPlayer.configure(shakaPlayerConfig.customConfiguration);
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
