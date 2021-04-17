import { hlsjsSetup, hlsjsCleanup } from './hlsjsSetup';
import Hls from 'hls.js';

test('hlsjsSetup() applies default configuration and instantiates hls.js with specified video element.', () => {
  Hls.mockClear();
  const videoElement = { src: null };
  const configuration = {
    logLevel: 'DEBUG'
  };
  const setupPromise = hlsjsSetup(videoElement, {}, configuration);
  expect(Hls).toHaveBeenCalledWith({
    debug: true,
    autoStartLoad: false
  });
  return setupPromise.then(hls => {
    return expect(hls.attachMedia).toHaveBeenCalledWith(videoElement);
  });
});

test('hlsjsSetup() merges passthrough configuration with integration-specific config.', () => {
  Hls.mockClear();
  const videoElement = { src: null };
  const configuration = {
    logLevel: 'DEBUG',
    hlsjs: {
      customConfiguration: {
        capLevelToPlayerSize: true,
        autoStartLoad: true
      }
    }
  };
  hlsjsSetup(videoElement, {}, configuration);
  expect(Hls).toHaveBeenCalledWith({
    debug: true,
    autoStartLoad: true,
    capLevelToPlayerSize: true
  });
});

test('hlsjsSetup() adds Widevine DRM playback details to Hls config.', () => {
  Hls.mockClear();
  const videoElement = { src: null };
  const configuration = {
    hlsjs: {
      customConfiguration: {
        capLevelToPlayerSize: true
      }
    }
  };
  const source = {
    licenseUrl: 'https://example.com/widevine',
    licenseAcquisitionDetails: {
      robustness: {
        'com.widevine.alpha': {
          audio: 'SW_SECURE_DECODE',
          video: 'HW_SECURE_DECODE'
        }
      }
    }
  };
  hlsjsSetup(videoElement, source, configuration);
  expect(Hls).toHaveBeenCalledWith({
    debug: false,
    autoStartLoad: false,
    capLevelToPlayerSize: true,
    emeEnabled: true,
    widevineLicenseUrl: 'https://example.com/widevine',
    drmSystemOptions: {
      audioRobustness: 'SW_SECURE_DECODE',
      videoRobustness: 'HW_SECURE_DECODE'
    }
  });
});

test('hlsjsCleanup() destroys the Hls instance.', () => {
  const videoElement = { src: null };
  const setupPromise = hlsjsSetup(videoElement);
  return setupPromise.then(hls => {
    const instanceKeeper = { hls, subscribers: [jest.fn()] };
    hlsjsCleanup(instanceKeeper);

    expect(hls.stopLoad).toHaveBeenCalled();
    expect(hls.destroy).toHaveBeenCalled();
    expect(instanceKeeper.subscribers[0]).toHaveBeenCalledWith(hls, 'off');
  });
});
