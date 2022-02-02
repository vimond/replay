import { shakaSetup } from './shakaSetup';
import shaka, { configure, destroy } from 'shaka-player';

beforeEach(() => {
  shaka.Player.mockClear();
  configure.mockClear();
  destroy.mockClear();
  shaka.polyfill.installAll.mockClear();
  shaka.polyfill.MediaCapabilities.install.mockClear();
});

window.MediaSource = { isTypeSupported: () => {} };

test('Shaka shakaSetup() instantiates a shaka.Player.', () => {
  const videoElement = {};
  const shakaPlayer = shakaSetup(shaka, videoElement);
  expect(shaka.Player).toHaveBeenCalledWith(videoElement);
  expect(shakaPlayer).toBeDefined();
});

describe('Shaka shakaSetup() polyfill installation.', () => {
  test('All installed when configured explicitly', () => {
    const videoElement = {};
    shakaSetup(shaka, videoElement, { shakaPlayer: { installPolyfills: true } });
    expect(shaka.polyfill.installAll).toHaveBeenCalled();
    expect(shaka.polyfill.MediaCapabilities.install).not.toHaveBeenCalled();
  });
  test('MediaCapabilities installed by default when not configured', () => {
    const videoElement = {};
    shakaSetup(shaka, videoElement, { shakaPlayer: {} });
    expect(shaka.polyfill.installAll).not.toHaveBeenCalled();
    expect(shaka.polyfill.MediaCapabilities.install).toHaveBeenCalled();
  });
  test('MediaCapabilities installed by default when no configuration object is present', () => {
    const videoElement = {};
    shakaSetup(shaka, videoElement);
    expect(shaka.polyfill.installAll).not.toHaveBeenCalled();
    expect(shaka.polyfill.MediaCapabilities.install).toHaveBeenCalled();
  });
  test('MediaCapabilities still installed when all not configured explicitly to not be done', () => {
    const videoElement = {};
    shakaSetup(shaka, videoElement, { shakaPlayer: { installPolyfills: false } });
    expect(shaka.polyfill.installAll).not.toHaveBeenCalled();
    expect(shaka.polyfill.MediaCapabilities.install).toHaveBeenCalled();
  });
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
