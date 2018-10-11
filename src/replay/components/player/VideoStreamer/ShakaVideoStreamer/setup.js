import type { ShakaPlayer, ShakaVideoStreamerConfiguration } from './types';
import shaka from 'shaka-player';

export function setup(videoElement, configuration: ShakaVideoStreamerConfiguration) : ShakaPlayer {
  const shakaPlayerConfig = configuration && configuration.shakaPlayer;
  if (shakaPlayerConfig && shakaPlayerConfig.installPolyfills) {
    shaka.polyfill.installAll();
  }
  const shakaPlayer = new shaka.Player(videoElement);
  if (shakaPlayerConfig && shakaPlayerConfig.playerConfiguration) {
    debugger;
    shakaPlayer.configure(shakaPlayerConfig.playerConfiguration);
  }
  return shakaPlayer;
}

export function cleanup(shakaPlayer) {
  if (shakaPlayer) {
    shakaPlayer.destroy();
  }
}
