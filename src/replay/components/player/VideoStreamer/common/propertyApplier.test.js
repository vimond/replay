import { getPropertyApplier } from './propertyApplier';

const getVideoElementMock = () => ({
  play: jest.fn(),
  pause: jest.fn(),
  currentTime: 0,
  duration: NaN,
  volume: 0.8,
  muted: false
});

const getStreamRangeHelper = () => ({
  adjustForDvrStartOffset: jest.fn(),
  calculateNewState: jest.fn(),
  setPosition: jest.fn(),
  gotoLive: jest.fn()
});

const getTextTrackManager = () => ({
  handleSelectedTextTrackChange: jest.fn()
});

const getAudioTrackManager = () => ({
  handleSelectedAudioTrackChange: jest.fn()
});

const getBitrateManager = () => ({
  lockBitrate: jest.fn(),
  capBitrate: jest.fn()
});

test('applyProperties() plays or pauses the video according to the isPaused prop passed', () => {
  const videoElement = getVideoElementMock();

  const propsUpdate1 = { isPaused: true };
  const propsUpdate2 = { isMuted: true }; // isPaused is unspecified.
  const propsUpdate3 = { volume: 1, isPaused: false };

  const applyProperties = getPropertyApplier(videoElement, getStreamRangeHelper());
  applyProperties(propsUpdate1);
  expect(videoElement.play).not.toHaveBeenCalled();
  expect(videoElement.pause).toHaveBeenCalledTimes(1);

  applyProperties(propsUpdate2);
  expect(videoElement.play).not.toHaveBeenCalled();
  expect(videoElement.pause).toHaveBeenCalledTimes(1);

  applyProperties(propsUpdate3);
  expect(videoElement.pause).toHaveBeenCalledTimes(1);
  expect(videoElement.play).toHaveBeenCalledTimes(1);
});

test('applyProperties() mutes, unmutes, and adjusts the volume according to isMuted and volume properties being set.', () => {
  const videoElement = getVideoElementMock();
  const propsUpdate1 = { volume: 1 };
  const propsUpdate2 = { isMuted: true };
  const propsUpdate3 = { isMuted: false, volume: 1 };
  const propsUpdate4 = { volume: 0 };

  const applyProperties = getPropertyApplier(videoElement, getStreamRangeHelper());
  applyProperties(propsUpdate1);
  expect(videoElement.volume).toBe(1);
  expect(videoElement.muted).toBe(false);

  applyProperties(propsUpdate2);
  expect(videoElement.volume).toBe(1);
  expect(videoElement.muted).toBe(true);

  applyProperties(propsUpdate3);
  expect(videoElement.volume).toBe(1);
  expect(videoElement.muted).toBe(false);

  applyProperties(propsUpdate3); // Repeated, should be idempotent or whatever it is called.
  expect(videoElement.volume).toBe(1);
  expect(videoElement.muted).toBe(false);

  applyProperties(propsUpdate4);
  expect(videoElement.volume).toBe(0);
  expect(videoElement.muted).toBe(false);
});

test('applyProperties() invokes setPosition or gotoLive when position or isAtLivePosition: true properties are set .', () => {
  const videoElement = getVideoElementMock();
  const streamRangeHelper = getStreamRangeHelper();
  const propsUpdate1 = { position: 3 };
  const propsUpdate2 = { position: 135 };
  const propsUpdate3 = { isAtLivePosition: true };
  const propsUpdate4 = { isAtLivePosition: false };

  const applyProperties = getPropertyApplier(videoElement, streamRangeHelper);

  applyProperties(propsUpdate1, null, streamRangeHelper);
  expect(streamRangeHelper.setPosition).toHaveBeenCalledWith(3);
  expect(streamRangeHelper.gotoLive).not.toHaveBeenCalled();

  applyProperties(propsUpdate2, null, streamRangeHelper);
  expect(streamRangeHelper.setPosition).toHaveBeenCalledWith(135);
  expect(streamRangeHelper.setPosition).toHaveBeenCalledTimes(2);
  expect(streamRangeHelper.gotoLive).not.toHaveBeenCalled();

  applyProperties(propsUpdate3, null, streamRangeHelper);
  expect(streamRangeHelper.setPosition).toHaveBeenCalledTimes(2);
  expect(streamRangeHelper.gotoLive).toHaveBeenCalledTimes(1);

  applyProperties(propsUpdate4, null, streamRangeHelper);
  expect(streamRangeHelper.setPosition).toHaveBeenCalledTimes(2);
  expect(streamRangeHelper.gotoLive).toHaveBeenCalledTimes(1);
});

test('applyProperties() invokes handleTextTrackChange or handleAudioTrackChange when selectedTextTrack or selectedAudioTrack properties are set .', () => {
  const textTrack1 = {
    language: 'no',
    kind: 'subtitles',
    label: 'A: Norwegian',
    origin: 'side-loaded'
  };
  const textTrack2 = {
    language: 'sv',
    kind: 'captions',
    label: 'B: Swedish',
    origin: 'side-loaded'
  };
  const audioTrack1 = {
    id: '1',
    language: 'en',
    kind: '',
    label: 'English',
    origin: 'in-stream'
  };
  const audioTrack2 = {
    id: '2',
    language: 'en',
    kind: 'commentary',
    label: '',
    origin: 'in-stream'
  };

  const videoElement = getVideoElementMock();
  const textTrackManager = getTextTrackManager();
  const audioTrackManager = getAudioTrackManager();
  const bitrateManager = getBitrateManager();
  const applyProperties = getPropertyApplier(
    videoElement,
    getStreamRangeHelper(),
    textTrackManager,
    audioTrackManager,
    bitrateManager
  );

  const propsUpdate1 = { selectedTextTrack: textTrack1 };
  const propsUpdate2 = { selectedAudioTrack: audioTrack1 };
  const propsUpdate3 = { selectedTextTrack: textTrack2 };
  const propsUpdate4 = { selectedAudioTrack: audioTrack2 };
  const propsUpdate5 = { selectedTextTrack: textTrack2 };
  const propsUpdate6 = { isPaused: false };
  const propsUpdate7 = { selectedTextTrack: null, selectedAudioTrack: null };

  applyProperties(propsUpdate1);
  expect(textTrackManager.handleSelectedTextTrackChange).toHaveBeenCalledWith(textTrack1);
  expect(audioTrackManager.handleSelectedAudioTrackChange).not.toHaveBeenCalled();

  applyProperties(propsUpdate2);
  expect(textTrackManager.handleSelectedTextTrackChange).toHaveBeenCalledWith(textTrack1);
  expect(textTrackManager.handleSelectedTextTrackChange).toHaveBeenCalledTimes(1);
  expect(audioTrackManager.handleSelectedAudioTrackChange).toHaveBeenCalledWith(audioTrack1);

  applyProperties(propsUpdate3);
  expect(textTrackManager.handleSelectedTextTrackChange.mock.calls[1][0]).toBe(textTrack2);
  expect(audioTrackManager.handleSelectedAudioTrackChange).toHaveBeenCalledTimes(1);

  applyProperties(propsUpdate4);
  expect(audioTrackManager.handleSelectedAudioTrackChange.mock.calls[1][0]).toBe(audioTrack2);
  expect(textTrackManager.handleSelectedTextTrackChange).toHaveBeenCalledTimes(2);

  applyProperties(propsUpdate5);
  expect(textTrackManager.handleSelectedTextTrackChange.mock.calls[2][0]).toBe(textTrack2);
  expect(audioTrackManager.handleSelectedAudioTrackChange).toHaveBeenCalledTimes(2);

  applyProperties(propsUpdate6);
  expect(textTrackManager.handleSelectedTextTrackChange).toHaveBeenCalledTimes(3);
  expect(audioTrackManager.handleSelectedAudioTrackChange).toHaveBeenCalledTimes(2);

  applyProperties(propsUpdate7);
  expect(textTrackManager.handleSelectedTextTrackChange.mock.calls[3][0]).toBe(null);
  expect(audioTrackManager.handleSelectedAudioTrackChange).toHaveBeenCalledTimes(2);
  expect(textTrackManager.handleSelectedTextTrackChange.mock.calls[1][0]).not.toBe(null);
});

test('applyProperties() invokes lockBitrate or capBitrate when lockedBitrate or fixedBitrate properties are set.', () => {
  const videoElement = getVideoElementMock();
  const textTrackManager = getTextTrackManager();
  const audioTrackManager = getAudioTrackManager();
  const bitrateManager = getBitrateManager();
  const applyProperties = getPropertyApplier(
    videoElement,
    getStreamRangeHelper(),
    textTrackManager,
    audioTrackManager,
    bitrateManager
  );
  applyProperties({ lockedBitrate: 123 });
  applyProperties({ maxBitrate: 345 });
  expect(bitrateManager.lockBitrate).toHaveBeenCalledWith(123);
  expect(bitrateManager.capBitrate).toHaveBeenCalledWith(345);
});

test("applyProperties() doesn't break if lockedBitrate or fixedBitrate properties are set, and there is no bitrateManager.", () => {
  const videoElement = getVideoElementMock();
  const textTrackManager = getTextTrackManager();
  const audioTrackManager = getAudioTrackManager();
  const applyProperties = getPropertyApplier(videoElement, getStreamRangeHelper(), textTrackManager, audioTrackManager);
  applyProperties({ lockedBitrate: 123 });
  applyProperties({ maxBitrate: 345 });
  expect(true).toBe(true);
});
