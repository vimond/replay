import getRxEventHandlers from './rxEventHandlers';

const getMockVideoElement = ({ seekable = { length: 0 }, currentTime = 0, duration = NaN, paused = false } = {}) => ({
  seekable,
  duration,
  currentTime,
  paused,
  pause: jest.fn(),
  volume: 0.5,
  muted: false,
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

const getMockRxPlayer = getEventHandling;

const setup = ({ initialPlaybackProps, onPlaybackError, lifeCycleStage = 'new' } = {}) => {
  const mockStreamRangeState = { position: 123, duration: 234, playMode: 'ondemand', isAtLiveEdge: false };
  const mocks = {
    streamer: { props: { initialPlaybackProps, onPlaybackError } },
    rxPlayer: getMockRxPlayer(),
    videoElement: getMockVideoElement(),
    streamRangeHelper: {
      adjustForDvrStartOffset: jest.fn(),
      calculateNewState: jest.fn().mockReturnValue(mockStreamRangeState)
    },
    configuration: {},
    applyProperties: jest.fn(),
    updateStreamState: jest.fn()
  };
  const lifeCycleManager = {
    setStage: jest.fn(),
    getStage: jest.fn().mockReturnValue(lifeCycleStage)
  };
  const rxEventHandlers = getRxEventHandlers(mocks);
  rxEventHandlers.setLifeCycleManager(lifeCycleManager);
  return {
    mockStreamRangeState,
    rxEventHandlers,
    lifeCycleManager,
    updateStreamState: mocks.updateStreamState,
    videoElement: mocks.videoElement,
    applyProperties: mocks.applyProperties,
    rxPlayer: mocks.rxPlayer
  };
};

test("Handling of Rx-player's playerStateChange event containing LOADING.", () => {
  const { rxPlayer, updateStreamState, lifeCycleManager } = setup();
  rxPlayer.eventHandlers.playerStateChange('LOADING');
  expect(lifeCycleManager.setStage).toHaveBeenCalledWith('starting');
  expect(updateStreamState).toHaveBeenCalledWith({
    playState: 'starting',
    isBuffering: true,
    volume: 0.5,
    isMuted: false,
    isPipAvailable: false
  });
});

test("Handling of Rx-player's playerStateChange event containing LOADED, and no autoplay.", () => {
  const initialPlaybackProps = { isMuted: true, volume: 1, bitrateFix: 1000, bitrateCap: 2000 };
  const { rxPlayer, updateStreamState, lifeCycleManager, videoElement, applyProperties } = setup({
    initialPlaybackProps
  });
  videoElement.paused = true;
  rxPlayer.eventHandlers.playerStateChange('LOADED');
  expect(lifeCycleManager.setStage).toHaveBeenCalledWith('started');
  expect(applyProperties).toHaveBeenCalledWith(initialPlaybackProps);
  expect(updateStreamState).toHaveBeenCalledWith({
    playState: 'paused',
    isPaused: true,
    isBuffering: false,
    isSeeking: false
  });
});

test("Handling of Rx-player's playerStateChange event containing LOADED, with autoplay.", () => {
  const initialPlaybackProps = { isMuted: true, volume: 1, bitrateFix: 1000, bitrateCap: 2000 };
  const { rxPlayer, updateStreamState, lifeCycleManager, applyProperties } = setup({
    initialPlaybackProps
  });
  rxPlayer.eventHandlers.playerStateChange('LOADED');
  expect(lifeCycleManager.setStage).toHaveBeenCalledWith('started');
  expect(applyProperties).toHaveBeenCalledWith(initialPlaybackProps);
  expect(updateStreamState).not.toHaveBeenCalledWith({
    playState: 'paused',
    isPaused: true,
    isBuffering: false,
    isSeeking: false
  });
});

test("Handling of Rx-player's playerStateChange event containing PLAYING.", () => {
  const { rxPlayer, updateStreamState } = setup();
  rxPlayer.eventHandlers.playerStateChange('PLAYING');
  expect(updateStreamState).toHaveBeenCalledWith({
    playState: 'playing',
    isPaused: false,
    isBuffering: false,
    isSeeking: false
  });
});

test("Handling of Rx-player's playerStateChange event containing PAUSED.", () => {
  const { rxPlayer, updateStreamState } = setup();
  rxPlayer.eventHandlers.playerStateChange('PAUSED');
  expect(updateStreamState).toHaveBeenCalledWith({
    playState: 'paused',
    isPaused: true,
    isBuffering: false,
    isSeeking: false
  });
});

test("Handling of Rx-player's playerStateChange event containing BUFFERING.", () => {
  const { rxPlayer, updateStreamState } = setup();
  rxPlayer.eventHandlers.playerStateChange('BUFFERING');
  expect(updateStreamState).toHaveBeenCalledWith({
    playState: 'buffering',
    isBuffering: true
  });
});

test("Handling of Rx-player's playerStateChange event containing RELOADING.", () => {
  const { rxPlayer, updateStreamState } = setup();
  rxPlayer.eventHandlers.playerStateChange('RELOADING');
  expect(updateStreamState).toHaveBeenCalledWith({
    playState: 'buffering',
    isBuffering: true
  });
});

test("Handling of Rx-player's playerStateChange event containing SEEKING.", () => {
  const { rxPlayer, updateStreamState } = setup();
  rxPlayer.eventHandlers.playerStateChange('SEEKING');
  expect(updateStreamState).toHaveBeenCalledWith({
    playState: 'seeking',
    isBuffering: true,
    isSeeking: true
  });
});

test("Handling of Rx-player's playerStateChange event containing ENDED.", () => {
  const { rxPlayer, updateStreamState } = setup({ lifeCycleStage: 'started' });
  rxPlayer.eventHandlers.playerStateChange('ENDED');
  // expect(lifeCycleManager.setStage).toHaveBeenCalledWith('ended');
  expect(updateStreamState).toHaveBeenCalledWith({ playState: 'inactive', isBuffering: false, isSeeking: false });
});

test("Handling of Rx-player's playerStateChange event containing STOPPED.", () => {
  const { rxPlayer, updateStreamState } = setup({ lifeCycleStage: 'started' });
  rxPlayer.eventHandlers.playerStateChange('STOPPED');
  // expect(lifeCycleManager.setStage).toHaveBeenCalledWith('ended');
  expect(updateStreamState).toHaveBeenCalledWith({ playState: 'inactive', isBuffering: false, isSeeking: false });
});

test("Handling of Rx-player's positionUpdate event.", () => {
  const { rxPlayer, mockStreamRangeState, updateStreamState } = setup();
  rxPlayer.eventHandlers.positionUpdate();
  expect(updateStreamState).toHaveBeenCalledWith(mockStreamRangeState);
});

test("Handling of Rx-player's warning and error event.", () => {
  const onPlaybackError = jest.fn();
  const { rxPlayer, updateStreamState, lifeCycleManager } = setup({ onPlaybackError });
  rxPlayer.eventHandlers.warning(new Error('Simple warning message.'));
  rxPlayer.eventHandlers.error(new Error('Simple error message.'));
  const warning = onPlaybackError.mock.calls[0][0];
  const error = onPlaybackError.mock.calls[1][0];
  expect(warning.technology).toBe('rxplayer');
  expect(warning.code).toBe('STREAM_ERROR');
  expect(warning.severity).toBe('WARNING');
  expect(warning.sourceError.message).toBe('Simple warning message.');
  expect(error.technology).toBe('rxplayer');
  expect(error.code).toBe('STREAM_ERROR');
  expect(error.severity).toBe('FATAL');
  expect(error.sourceError.message).toBe('Simple error message.');
  expect(lifeCycleManager.setStage).toHaveBeenCalledWith('dead');
  expect(lifeCycleManager.setStage).toHaveBeenCalledTimes(1);
  expect(updateStreamState).toHaveBeenCalledWith({ playState: 'inactive', isBuffering: false, isSeeking: false });
});
