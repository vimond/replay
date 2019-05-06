import { hlsjsSetup, hlsjsCleanup } from './hlsjsSetup';
import Hls from 'hls.js';

test('hlsjsSetup() applies default configuration and instantiates hls.js with specified video element.', () => {
  Hls.mockClear();
  const videoElement = { src: null };
  const configuration = {
    logLevel: 'DEBUG'
  };
  const setupPromise = hlsjsSetup(videoElement, configuration);
  expect(Hls).toHaveBeenCalledWith({
    debug: true,
    autoStartLoad: false,
    enableWorker: false
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
  hlsjsSetup(videoElement, configuration);
  expect(Hls).toHaveBeenCalledWith({
    debug: true,
    autoStartLoad: true,
    capLevelToPlayerSize: true,
    enableWorker: false
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
