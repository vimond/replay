// @flow
import type { ShakaPlayer } from './types';
import shaka from 'shaka-player';
import type { ShakaVideoStreamerConfiguration } from './ShakaVideoStreamer';

export function shakaSetup(
  videoElement: HTMLVideoElement,
  configuration: ?ShakaVideoStreamerConfiguration
): ShakaPlayer {
  const shakaPlayerConfig = configuration && configuration.shakaPlayer;
  if (shakaPlayerConfig && shakaPlayerConfig.installPolyfills) {
    shaka.polyfill.installAll();
  }
  const shakaPlayer = new shaka.Player(videoElement);
  if (shakaPlayerConfig && shakaPlayerConfig.customConfiguration) {
    debugger;
    shakaPlayer.configure(shakaPlayerConfig.customConfiguration);
  }
  return shakaPlayer;
}

export function shakaCleanup(shakaPlayer: ShakaPlayer) {
  return Promise.resolve(shakaPlayer && shakaPlayer.destroy());
}
