import getStreamRangeHelper from './shakaStreamRangeHelper';

const getSeekableRanges = (start, end) => ({
  length: 1,
  start: () => start,
  end: () => end
});

const startDate = new Date('2018-07-30T18:49:36.120Z');
const getStartDate = () => startDate;

const getMockVideoElement = ({ currentTime = 0, duration = NaN, paused = false } = {}) => ({
  duration,
  currentTime,
  paused
});

const getMockShakaPlayer = (isLive = false, seekRange, startDateTime) => {
  return {
    isLive: () => isLive,
    seekRange: () => seekRange,
    getPresentationStartTimeAsDate: () => startDateTime
  };
};

const setup = (
  mockVideoElement = getMockVideoElement(),
  shakaPlayer = getMockShakaPlayer(true, { start: 0, end: 0 }, new Date())
) => {
  const streamRangeHelper = getStreamRangeHelper(mockVideoElement, shakaPlayer);
  return {
    streamRangeHelper,
    mockVideoElement,
    shakaPlayer
  };
};

test('When Shaka reports a live stream, but no valid duration, report the stream as live and playing at live position.', () => {
  const { streamRangeHelper } = setup();
  const streamState = streamRangeHelper.calculateNewState();
  expect(streamState).toMatchObject({
    playMode: 'live',
    isAtLivePosition: true
  });
});

test('When Shaka reports a live stream, and there is a seekable range shorter than 100 seconds, report the stream as live without DVR.', () => {
  const mockVideoElement = getMockVideoElement({
    currentTime: 121,
    duration: Infinity
  });
  const mockShakaPlayer = getMockShakaPlayer(true, { start: 13, end: 93 });
  const { streamRangeHelper } = setup(mockVideoElement, mockShakaPlayer);
  const streamState = streamRangeHelper.calculateNewState();
  expect(streamState).toMatchObject({
    playMode: 'live',
    isAtLivePosition: true
  });
});

test('When Shaka reports a live stream, and there is a seekable range longer than 100 seconds, report the stream as live with DVR.', () => {
  const mockVideoElement = getMockVideoElement({
    currentTime: 121,
    duration: Infinity
  });
  const mockShakaPlayer = getMockShakaPlayer(true, { start: 13, end: 123 });
  const { streamRangeHelper } = setup(mockVideoElement, mockShakaPlayer);
  const streamState = streamRangeHelper.calculateNewState();
  expect(streamState).toMatchObject({ playMode: 'livedvr' });
});

test('When Shaka reports an on demand stream, report the stream as on demand, and report the duration.', () => {
  const mockVideoElement = getMockVideoElement({ currentTime: 121, duration: 242 });
  const mockShakaPlayer = getMockShakaPlayer(false, { start: 0, end: 0 });
  const { streamRangeHelper } = setup(mockVideoElement, mockShakaPlayer);
  const streamState = streamRangeHelper.calculateNewState();
  expect(streamState).toMatchObject({
    playMode: 'ondemand',
    isAtLivePosition: false,
    duration: 242
  });
  const mockShakaPlayer2 = getMockShakaPlayer(false, { start: 13, end: 57 });
  const oneMore = setup(mockVideoElement, mockShakaPlayer2);
  const streamState2 = oneMore.streamRangeHelper.calculateNewState();
  expect(streamState2).toMatchObject({
    duration: 44
  });
});

test('When duration is Infinity and there is no seekable range, report the position from currentTime, and duration as 0.', () => {
  const mockShakaPlayer = getMockShakaPlayer(true, { start: 0, end: 0 }, new Date());
  const mockVideoElement = getMockVideoElement({ currentTime: 13, duration: Infinity });
  const { streamRangeHelper } = setup(mockVideoElement, mockShakaPlayer);
  const streamState = streamRangeHelper.calculateNewState();
  expect(streamState).toMatchObject({
    position: 13,
    duration: 0
  });
});

test(
  'When Shaka reports a live stream, and there is a seekable range, report the range length as the duration, and the ' +
    'position as currentTime offset from range start.',
  () => {
    const mockVideoElement = getMockVideoElement({
      currentTime: 30
    });
    const mockShakaPlayer = getMockShakaPlayer(true, { start: 13, end: 123 });
    const { streamRangeHelper } = setup(mockVideoElement, mockShakaPlayer);
    const streamState = streamRangeHelper.calculateNewState();
    expect(streamState).toMatchObject({
      position: 17,
      duration: 110
    });
  }
);

test(
  'When there is no seekable range, and the duration is a normal number, report it as the duration. currentTime should be ' +
    'passed through as position.',
  () => {
    const mockVideoElement = getMockVideoElement({ currentTime: 13, duration: 234 });
    const mockShakaPlayer = getMockShakaPlayer(false, { start: 0, end: 0 });
    const { streamRangeHelper } = setup(mockVideoElement, mockShakaPlayer);
    const streamState = streamRangeHelper.calculateNewState();
    expect(streamState).toMatchObject({
      position: 13,
      duration: 234
    });
  }
);

test('When the position for a live stream is close to the duration (within a threshold), report it as playing at the live position', () => {
  const mockVideoElement = getMockVideoElement({
    currentTime: 115,
    duration: Infinity
  });
  const mockShakaPlayer = getMockShakaPlayer(true, { start: 13, end: 123 });
  const { streamRangeHelper } = setup(mockVideoElement, mockShakaPlayer);
  const streamState = streamRangeHelper.calculateNewState();
  expect(streamState).toMatchObject({
    isAtLivePosition: true
  });
});

test('When the position for a live stream is not close to the duration (limited by a threshold), report it as not playing at the live position', () => {
  const mockVideoElement = getMockVideoElement({
    currentTime: 100,
    duration: Infinity
  });
  const mockShakaPlayer = getMockShakaPlayer(true, { start: 13, end: 123 });
  const { streamRangeHelper } = setup(mockVideoElement, mockShakaPlayer);
  const streamState = streamRangeHelper.calculateNewState();
  expect(streamState).toMatchObject({
    playMode: 'livedvr',
    isAtLivePosition: false
  });
});

test(
  'For a live stream, when Shaka reports a valid date for availabilityStartTime (aka presentationStartTime), ' +
    'report real absolutePosition and absoluteStartPosition values from it.',
  () => {
    const mockVideoElement = getMockVideoElement({
      currentTime: 30,
      duration: Infinity
    });
    const mockShakaPlayer = getMockShakaPlayer(true, { start: 13, end: 123 }, getStartDate());
    const { streamRangeHelper } = setup(mockVideoElement, mockShakaPlayer);
    const { absolutePosition, absoluteStartPosition } = streamRangeHelper.calculateNewState();

    expect(absolutePosition.getTime()).toBe(startDate.getTime() + 30000);
    expect(absoluteStartPosition.getTime()).toBe(startDate.getTime() + 13000);
  }
);

test(
  'For a live stream, when Shaka does not a valid date for availabilityStartTime, ' +
    'report absolutePosition and absoluteStartPosition values based on local clock time.',
  () => {
    const mockVideoElement = getMockVideoElement({
      currentTime: 30,
      duration: Infinity
    });
    const mockShakaPlayer = getMockShakaPlayer(true, { start: 13, end: 123 });
    const { streamRangeHelper } = setup(mockVideoElement, mockShakaPlayer);
    const { absolutePosition, absoluteStartPosition } = streamRangeHelper.calculateNewState();
    expect(absolutePosition.getTime() / 1000).toBeCloseTo(new Date().getTime() / 1000, 0);
    // Testing real now-dates is a risky business, since timing of tests aren't guaranteed or predictable.
    // Dividing by 3000 means that values within 3 seconds from the exact value is accepted.
    expect(absoluteStartPosition.getTime() / 3000).toBeCloseTo((new Date().getTime() - 17000) / 3000, 0);
  }
);

// TODO: Test the other three stream range helper methods!
