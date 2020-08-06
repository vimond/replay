import { shakaSetup } from './shakaSetup';
import shaka, { configure, destroy } from 'shaka-player';

beforeEach(() => {
  shaka.Player.mockClear();
  configure.mockClear();
  destroy.mockClear();
  shaka.polyfill.installAll.mockClear();
});

window.MediaSource = { isTypeSupported: () => {} };

test('Shaka shakaSetup() instantiates a shaka.Player.', () => {
  const videoElement = {};
  const shakaPlayer = shakaSetup(shaka, videoElement);
  expect(shaka.Player).toHaveBeenCalledWith(videoElement);
  expect(shakaPlayer).toBeDefined();
});

test('Shaka shakaSetup() installs polyfills, if configured.', () => {
  const videoElement = {};
  shakaSetup(shaka, videoElement, { shakaPlayer: { installPolyfills: true } });
  expect(shaka.polyfill.installAll).toHaveBeenCalled();
});

test('Shaka shakaSetup() passes configuration to the Shaka player instance, if supplied.', () => {
  const videoElement = {};
  const config = {
    shakaPlayer: {
      customConfiguration: {
        some: 'value'
      }
    }
  };
  shakaSetup(shaka, videoElement, config);
  expect(configure).toHaveBeenCalledWith(config.shakaPlayer.customConfiguration);
});

test('Shaka cleanup() destroys a shaka.Player.', () => {
  const videoElement = {};
  const shakaPlayer = shakaSetup(shaka, videoElement);
  shakaPlayer.destroy();
  expect(destroy).toHaveBeenCalled();
});
