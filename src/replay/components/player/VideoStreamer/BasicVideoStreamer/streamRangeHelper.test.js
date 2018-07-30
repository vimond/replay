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

const setup = (mockVideoElement = getMockVideoElement(), updateFn = jest.fn()) => {
  const streamRangeHelper = getStreamRangeHelper({ current: mockVideoElement }, 10, 1);
  streamRangeHelper.setUpdater(updateFn);
  return {
    streamRangeHelper,
    updateFn,
    mockVideoElement
  };
};

test("When there is no video element, don't report any updates.", () => {
  const { updateFn, streamRangeHelper } = setup(null);
  streamRangeHelper.calculateNewState();
  expect(updateFn).toHaveBeenCalledTimes(0);
});

test('When the video element duration is Infinity and there are no seekable ranges, report the stream as live and playing at live position.', () => {
  const { updateFn, streamRangeHelper } = setup(getMockVideoElement({ currentTime: 13, duration: Infinity }));
  streamRangeHelper.calculateNewState();
  expect(updateFn.mock.calls[0][0]).toMatchObject({
    playMode: 'live',
    isAtLivePosition: true
  });
});

test('When duration is Infinity and there are seekable ranges longer than 100 seconds report the stream as live with DVR.', () => {
  const { updateFn, streamRangeHelper } = setup(
    getMockVideoElement({ currentTime: 121, duration: Infinity, seekable: getSeekableRanges(13, 123) })
  );
  streamRangeHelper.calculateNewState();
  expect(updateFn.mock.calls[0][0]).toMatchObject({
    playMode: 'livedvr',
    isAtLivePosition: true
  });
});

test('When duration is a normal number, report the stream as on demand.', () => {
  const { updateFn, streamRangeHelper } = setup(getMockVideoElement({ currentTime: 121, duration: 242 }));
  streamRangeHelper.calculateNewState();
  expect(updateFn.mock.calls[0][0]).toMatchObject({
    playMode: 'ondemand',
    isAtLivePosition: false
  });
});

test('When duration is Infinity and there are no seekable ranges, report the position from currentTime, and duration as 0.', () => {
  const { updateFn, streamRangeHelper } = setup(getMockVideoElement({ currentTime: 13, duration: Infinity }));
  streamRangeHelper.calculateNewState();
  expect(updateFn.mock.calls[0][0]).toMatchObject({
    position: 13,
    duration: 0
  });
});

test(
  'When duration is Infinity and there are seekable ranges, report the first range length as the duration, and the ' +
    'position as currentTime offset from range start.',
  () => {
    const { updateFn, streamRangeHelper } = setup(
      getMockVideoElement({ currentTime: 30, duration: Infinity, seekable: getSeekableRanges(13, 123) })
    );
    streamRangeHelper.calculateNewState();
    expect(updateFn.mock.calls[0][0]).toMatchObject({
      position: 17,
      duration: 110
    });
  }
);

test(
  'When there are no seekable ranges, and the duration is a normal number, report it as the duration. currentTime should be ' +
    'passed through as position.',
  () => {
    const { updateFn, streamRangeHelper } = setup(getMockVideoElement({ currentTime: 13, duration: 234 }));
    streamRangeHelper.calculateNewState();
    expect(updateFn.mock.calls[0][0]).toMatchObject({
      position: 13,
      duration: 234
    });
  }
);

test('When the position for a live stream is not close to the duration (limited by a threshold), report it as not playing at the live position', () => {
  const { updateFn, streamRangeHelper } = setup(
    getMockVideoElement({ currentTime: 100, duration: Infinity, seekable: getSeekableRanges(13, 123) })
  );
  streamRangeHelper.calculateNewState();
  expect(updateFn.mock.calls[0][0]).toMatchObject({
    playMode: 'livedvr',
    isAtLivePosition: false
  });
});

test('When the getStartDate method exists, and returns a valid date, report real absolutePosition and absoluteStartPosition values from it.', () => {
  const { updateFn, streamRangeHelper } = setup(
    getMockVideoElement({
      currentTime: 30,
      duration: Infinity,
      seekable: getSeekableRanges(13, 123),
      getStartDate: getStartDate
    })
  );
  streamRangeHelper.calculateNewState();
  const { absolutePosition, absoluteStartPosition } = updateFn.mock.calls[0][0];

  expect(absolutePosition.getTime()).toBe(startDate.getTime() + 30000);
  expect(absoluteStartPosition.getTime()).toBe(startDate.getTime() + 13000);
});

test(
  'When the getStartDate method does not exist or return a valid date, report absolutePosition and absoluteStartPosition ' +
    'values based on local clock time.',
  () => {
    const { updateFn, streamRangeHelper } = setup(
      getMockVideoElement({
        currentTime: 30,
        duration: Infinity,
        seekable: getSeekableRanges(13, 123)
      })
    );
    streamRangeHelper.calculateNewState();
    const { absolutePosition, absoluteStartPosition } = updateFn.mock.calls[0][0];

    expect(absolutePosition.getTime() / 1000).toBeCloseTo(new Date().getTime() / 1000, 0);
    // Testing real now-dates is a risky business, since timing of tests aren't guaranteed or predictable.
    // Dividing by 3000 means that values within 3 seconds from the exact value is accepted.
    expect(absoluteStartPosition.getTime() / 3000).toBeCloseTo((new Date().getTime() - 17000) / 3000, 0);
  }
);

test('If live stream playback pauses, start timer based updates of positions and play mode.', done => {
  const updateFn = newState => {
    try {
      expect(newState).toMatchObject({
        position: 108,
        duration: 110,
        isAtLivePosition: true,
        playMode: 'livedvr'
      });
      streamRangeHelper.stopPauseStateUpdates();
      done();
    } catch (e) {
      streamRangeHelper.stopPauseStateUpdates();
      done.fail(e);
    }
  };

  const { streamRangeHelper } = setup(
    getMockVideoElement({ currentTime: 121, duration: Infinity, seekable: getSeekableRanges(13, 123) }),
    updateFn
  );
  streamRangeHelper.startPauseStateUpdates();
});

test('If playback pauses and current position falls outside (before) DVR range, it should be adjusted.', done => {
  let counter = 0;
  const updateFn = newState => {
    try {
      if (counter === 2) {
        expect(newState).toMatchObject({
          position: 2
        });
        streamRangeHelper.stopPauseStateUpdates();
        done();
      } else if (counter === 1) {
        expect(newState).toMatchObject({
          position: 10
        });
        counter++;
        mockVideoElement.seekable = getSeekableRanges(44, 133);
        mockVideoElement.currentTime = 46;
      } else {
        expect(newState).toMatchObject({
          position: 10
        });
        counter++;
        mockVideoElement.seekable = getSeekableRanges(44, 128);
      }
    } catch (e) {
      streamRangeHelper.stopPauseStateUpdates();
      done.fail(e);
    }
  };

  const { streamRangeHelper, mockVideoElement } = setup(
    getMockVideoElement({ currentTime: 15, duration: Infinity, paused: true, seekable: getSeekableRanges(23, 123) }),
    updateFn
  );
  streamRangeHelper.startPauseStateUpdates();
});
