import getStreamRangeHelper from './streamRangeHelper';

const getSeekableRanges = (start, end) => ({
  length: 1,
  start: () => start,
  end: () => end
});

const startDate = new Date('2018-07-30T18:49:36.120Z');
const getStartDate = () => startDate;

const getMockVideoElement = ({
  seekable = { length: 0 },
  currentTime = 0,
  duration = NaN,
  getStartDate = undefined,
  paused = false
} = {}) => ({
  seekable,
  duration,
  currentTime,
  paused,
  getStartDate
});

const setup = (mockVideoElement = getMockVideoElement()) => {
  const streamRangeHelper = getStreamRangeHelper(10, 1);
  return {
    streamRangeHelper,
    mockVideoElement
  };
};

test('When the video element duration is Infinity and there are no seekable ranges, report the stream as live and playing at live position.', () => {
  const { streamRangeHelper } = setup();
  const mockVideoElement = getMockVideoElement({ currentTime: 13, duration: Infinity });
  const streamState = streamRangeHelper.calculateNewState(mockVideoElement);
  expect(streamState).toMatchObject({
    playMode: 'live',
    isAtLivePosition: true
  });
});

test('When duration is Infinity and there are seekable ranges longer than 100 seconds report the stream as live with DVR.', () => {
  const { streamRangeHelper } = setup();
  const mockVideoElement = getMockVideoElement({
    currentTime: 121,
    duration: Infinity,
    seekable: getSeekableRanges(13, 123)
  });
  const streamState = streamRangeHelper.calculateNewState(mockVideoElement);
  expect(streamState).toMatchObject({
    playMode: 'livedvr',
    isAtLivePosition: true
  });
});

test('When duration is a normal number, report the stream as on demand.', () => {
  const { streamRangeHelper } = setup();
  const mockVideoElement = getMockVideoElement({ currentTime: 121, duration: 242 });
  const streamState = streamRangeHelper.calculateNewState(mockVideoElement);
  expect(streamState).toMatchObject({
    playMode: 'ondemand',
    isAtLivePosition: false
  });
});

test('When duration is Infinity and there are no seekable ranges, report the position from currentTime, and duration as 0.', () => {
  const { streamRangeHelper } = setup();
  const mockVideoElement = getMockVideoElement({ currentTime: 13, duration: Infinity });
  const streamState = streamRangeHelper.calculateNewState(mockVideoElement);
  expect(streamState).toMatchObject({
    position: 13,
    duration: 0
  });
});

test(
  'When duration is Infinity and there are seekable ranges, report the first range length as the duration, and the ' +
    'position as currentTime offset from range start.',
  () => {
    const { streamRangeHelper } = setup();
    const mockVideoElement = getMockVideoElement({
      currentTime: 30,
      duration: Infinity,
      seekable: getSeekableRanges(13, 123)
    });
    const streamState = streamRangeHelper.calculateNewState(mockVideoElement);
    expect(streamState).toMatchObject({
      position: 17,
      duration: 110
    });
  }
);

test(
  'When there are no seekable ranges, and the duration is a normal number, report it as the duration. currentTime should be ' +
    'passed through as position.',
  () => {
    const { streamRangeHelper } = setup();
    const mockVideoElement = getMockVideoElement({ currentTime: 13, duration: 234 });
    const streamState = streamRangeHelper.calculateNewState(mockVideoElement);
    expect(streamState).toMatchObject({
      position: 13,
      duration: 234
    });
  }
);

test('When the position for a live stream is not close to the duration (limited by a threshold), report it as not playing at the live position', () => {
  const { streamRangeHelper } = setup();
  const mockVideoElement = getMockVideoElement({
    currentTime: 100,
    duration: Infinity,
    seekable: getSeekableRanges(13, 123)
  });
  const streamState = streamRangeHelper.calculateNewState(mockVideoElement);
  expect(streamState).toMatchObject({
    playMode: 'livedvr',
    isAtLivePosition: false
  });
});

test('When the getStartDate method exists, and returns a valid date, report real absolutePosition and absoluteStartPosition values from it.', () => {
  const { streamRangeHelper } = setup();
  const mockVideoElement = getMockVideoElement({
    currentTime: 30,
    duration: Infinity,
    seekable: getSeekableRanges(13, 123),
    getStartDate: getStartDate
  });
  const { absolutePosition, absoluteStartPosition } = streamRangeHelper.calculateNewState(mockVideoElement);

  expect(absolutePosition.getTime()).toBe(startDate.getTime() + 30000);
  expect(absoluteStartPosition.getTime()).toBe(startDate.getTime() + 13000);
});

test(
  'When the getStartDate method does not exist or return a valid date, report absolutePosition and absoluteStartPosition ' +
    'values based on local clock time.',
  () => {
    const { streamRangeHelper } = setup();
    const mockVideoElement = getMockVideoElement({
      currentTime: 30,
      duration: Infinity,
      seekable: getSeekableRanges(13, 123)
    });
    const { absolutePosition, absoluteStartPosition } = streamRangeHelper.calculateNewState(mockVideoElement);
    expect(absolutePosition.getTime() / 1000).toBeCloseTo(new Date().getTime() / 1000, 0);
    // Testing real now-dates is a risky business, since timing of tests aren't guaranteed or predictable.
    // Dividing by 3000 means that values within 3 seconds from the exact value is accepted.
    expect(absoluteStartPosition.getTime() / 3000).toBeCloseTo((new Date().getTime() - 17000) / 3000, 0);
  }
);
