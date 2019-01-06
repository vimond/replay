import getShakaEventHandlers from './shakaEventHandlers';
import { PlaybackError } from '../types';

const getMockVideoElement = ({ seekable = { length: 0 }, currentTime = 0, duration = NaN, paused = false } = {}) => ({
  seekable,
  duration,
  currentTime,
  paused,
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
});

const getEventHandling = () => {
  const eventHandlers = {};

  const addEventListener = (name, handler) => {
    if (eventHandlers[name]) {
      throw new Error(name + ' listener already added.');
    }
    eventHandlers[name] = handler;
  };

  const removeEventListener = (name, handler) => {
    if (!eventHandlers[name] || eventHandlers[name] !== handler) {
      throw new Error(name + ' listener removed or never added.');
    }
    delete eventHandlers[name];
  };

  return {
    eventHandlers,
    addEventListener,
    removeEventListener
  };
};

export const getMockShakaPlayer = (variantTracks, configuration = { abr: {} }) => {
  const eventHandling = getEventHandling();
  return {
    shakaPlayer: {
      configure: jest.fn(),
      isLive: () => false,
      seekRange: () => ({ start: 0, end: 0 }),
      getVariantTracks: () => variantTracks,
      selectVariantTrack: jest.fn(),
      addEventListener: eventHandling.addEventListener,
      removeEventListener: eventHandling.removeEventListener,
      mock: {
        updateVariantTracks: newTracks => (variantTracks = newTracks)
      }
    },
    eventHandling
  };
};

const getLifeCycleManager = () => {
  let stage = 'new';
  return {
    getStage: () => stage,
    setStage: newStage => (stage = newStage)
  };
};

describe('shakaEventHandlers', () => {
  const { shakaPlayer, eventHandling } = getMockShakaPlayer();
  const params = {
    streamer: {
      props: {
        onPlaybackError: jest.fn(),
        onStreamStateChange: jest.fn(),
        initialPlaybackProps: { isPaused: true, isMuted: true }
      }
    },
    videoElement: getMockVideoElement(),
    shakaPlayer,
    streamRangeHelper: {
      calculateNewState: jest.fn()
    },
    applyProperties: jest.fn(),
    updateStreamState: jest.fn()
  };

  params.streamRangeHelper.calculateNewState.mockReturnValue({ position: 1, duration: 2, playMode: 'ondemand' });
  const lifeCycleManager = getLifeCycleManager();
  const shakaEventHandlers = getShakaEventHandlers(params);
  shakaEventHandlers.setLifeCycleManager(lifeCycleManager);

  test('handles the Shaka loading event', () => {
    eventHandling.eventHandlers.loading();
    expect(lifeCycleManager.getStage()).toBe('starting');
    expect(params.updateStreamState).toHaveBeenCalledWith({
      playState: 'starting',
      isBuffering: true,
      volume: params.videoElement.volume,
      isMuted: params.videoElement.muted,
      isPipAvailable: false
    });
    expect(params.applyProperties).toHaveBeenCalledWith({ isMuted: true });
  });
  test('handles the Shaka streaming event', () => {
    eventHandling.eventHandlers.streaming();
    expect(lifeCycleManager.getStage()).toBe('starting'); // No change
    expect(params.updateStreamState).toHaveBeenLastCalledWith({ position: 1, duration: 2, playMode: 'ondemand' });
    expect(params.videoElement.pause).toHaveBeenCalled();
  });
  test('handles the Shaka buffering event', () => {
    eventHandling.eventHandlers.buffering({ buffering: true });
    expect(params.updateStreamState).toHaveBeenLastCalledWith({ isBuffering: true });
    eventHandling.eventHandlers.buffering({ buffering: false });
    expect(params.updateStreamState).toHaveBeenLastCalledWith({ isBuffering: false });

    lifeCycleManager.setStage('started');
    eventHandling.eventHandlers.buffering({ buffering: true });
    expect(params.updateStreamState).toHaveBeenLastCalledWith({ isBuffering: true, playState: 'buffering' });
  });
  test('handles the Shaka error event', () => {
    params.videoElement.error = new Error();
    eventHandling.eventHandlers.error({ detail: { message: 'An error' } });
    expect(params.streamer.props.onPlaybackError.mock.calls[0][0]).toBeInstanceOf(PlaybackError);
    expect(lifeCycleManager.getStage()).toBe('dead');
    expect(params.updateStreamState).toHaveBeenCalledWith({ error: params.videoElement.error });
    expect(params.updateStreamState).toHaveBeenLastCalledWith({
      playState: 'inactive',
      isBuffering: false,
      isSeeking: false
    });
  });
});
