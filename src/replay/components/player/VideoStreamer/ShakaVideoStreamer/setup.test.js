import { setup, cleanup } from './setup';
import shaka, { configure, destroy } from 'shaka-player';

beforeEach(() => {
  shaka.Player.mockClear();
  configure.mockClear();
  destroy.mockClear();
  shaka.polyfill.installAll.mockClear();
});

test('Shaka setup() instantiates a shaka.Player.', () => {
  const videoElement = {};
  const shakaPlayer = setup(videoElement);
  expect(shaka.Player).toHaveBeenCalledWith(videoElement);
  expect(shakaPlayer).toBeDefined();
});

test('Shaka setup() installs polyfills, if configured.', () => {
  const videoElement = {};
  setup(videoElement, { shakaPlayer: { installPolyfills: true } });
  expect(shaka.polyfill.installAll).toHaveBeenCalled();
});

test('Shaka setup() passes configuration to the Shaka player instance, if supplied.', () => {
  const videoElement = {};
  const config = {
    shakaPlayer: {
      playerConfiguration: {
        some: 'value'
      }
    }
  };
  setup(videoElement, config);
  expect(configure).toHaveBeenCalledWith(config.shakaPlayer.playerConfiguration);
});

test('Shaka cleanup() destroys a shaka.Player.', () => {
  const videoElement = {};
  const shakaPlayer = setup(videoElement);
  shakaPlayer.destroy();
  expect(destroy).toHaveBeenCalled();
});
