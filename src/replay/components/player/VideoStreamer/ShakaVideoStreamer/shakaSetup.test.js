import { shakaSetup, cleanup } from './shakaSetup';
import shaka, { configure, destroy } from 'shaka-player';

beforeEach(() => {
  shaka.Player.mockClear();
  configure.mockClear();
  destroy.mockClear();
  shaka.polyfill.installAll.mockClear();
});

test('Shaka shakaSetup() instantiates a shaka.Player.', () => {
  const videoElement = {};
  const shakaPlayer = shakaSetup(videoElement);
  expect(shaka.Player).toHaveBeenCalledWith(videoElement);
  expect(shakaPlayer).toBeDefined();
});

test('Shaka shakaSetup() installs polyfills, if configured.', () => {
  const videoElement = {};
  shakaSetup(videoElement, { shakaPlayer: { installPolyfills: true } });
  expect(shaka.polyfill.installAll).toHaveBeenCalled();
});

test('Shaka shakaSetup() passes configuration to the Shaka player instance, if supplied.', () => {
  const videoElement = {};
  const config = {
    shakaPlayer: {
      playerConfiguration: {
        some: 'value'
      }
    }
  };
  shakaSetup(videoElement, config);
  expect(configure).toHaveBeenCalledWith(config.shakaPlayer.playerConfiguration);
});

test('Shaka cleanup() destroys a shaka.Player.', () => {
  const videoElement = {};
  const shakaPlayer = shakaSetup(videoElement);
  shakaPlayer.destroy();
  expect(destroy).toHaveBeenCalled();
});
