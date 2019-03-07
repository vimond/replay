import getStreamRangeHelper from './rxStreamRangeHelper';

const setup = ({
  position,
  duration,
  minimumPosition,
  maximumPosition,
  live = false,
  wallClockTimeIso,
  playerState
}) => {
  const rxPlayer = {
    getPosition: () => position,
    getVideoDuration: () => duration,
    isLive: () => live,
    getMinimumPosition: () => minimumPosition,
    getMaximumPosition: () => maximumPosition,
    getWallClockTime: () => new Date(wallClockTimeIso).getTime() / 1000,
    getPlayerState: () => playerState,
    seekTo: jest.fn()
  };
  const streamRangeHelper = getStreamRangeHelper(rxPlayer);
  return {
    rxPlayer,
    streamRangeHelper
  };
};

test('When Rx-player reports a live stream, but a short interval between min and max position, report the stream as live and playing at live position.', () => {
  const { streamRangeHelper } = setup({ live: true, position: 123, minimumPosition: 100, maximumPosition: 130 });
  const streamState = streamRangeHelper.calculateNewState();
  expect(streamState).toMatchObject({
    playMode: 'live',
    isAtLiveEdge: true
  });
});

test(
  'When Rx-player reports a live stream, and there is a seekable range longer than 100 seconds, report the stream as live with DVR. ' +
    'Report the position as offset from minimum position',
  () => {
    const { streamRangeHelper } = setup({ live: true, position: 123, minimumPosition: 100, maximumPosition: 5000 });
    const streamState = streamRangeHelper.calculateNewState();
    expect(streamState).toMatchObject({ playMode: 'livedvr', duration: 4900, position: 23 });
  }
);

test('When Rx-player reports an on demand stream, report the stream as on demand, and report the duration.', () => {
  const { streamRangeHelper } = setup({ position: 123, duration: 234 });
  const streamState = streamRangeHelper.calculateNewState();
  expect(streamState).toMatchObject({
    playMode: 'ondemand',
    isAtLiveEdge: false,
    duration: 234,
    position: 123
  });
});

test('When the position for a live stream is close to the duration (within a threshold), report it as playing at the live position', () => {
  const { streamRangeHelper } = setup({ live: true, position: 780, minimumPosition: 123, maximumPosition: 789 });
  const streamState = streamRangeHelper.calculateNewState();
  expect(streamState).toMatchObject({
    isAtLiveEdge: true
  });
});

test('When the position for a live stream is not close to the duration (limited by a threshold), report it as not playing at the live position', () => {
  const { streamRangeHelper } = setup({ live: true, position: 750, minimumPosition: 123, maximumPosition: 789 });
  const streamState = streamRangeHelper.calculateNewState();
  expect(streamState).toMatchObject({
    isAtLiveEdge: false
  });
});

test('For a live stream, report absolutePosition and absoluteStartPosition based on wall clock time reported from current position.', () => {
  const { streamRangeHelper } = setup({
    live: true,
    minimumPosition: 100,
    maximumPosition: 500,
    position: 400,
    wallClockTimeIso: '2018-11-19T20:33:14.284Z'
  });
  const { absolutePosition, absoluteStartPosition } = streamRangeHelper.calculateNewState();

  expect(absolutePosition.getTime()).toBe(1542659594284);
  expect(absoluteStartPosition.getTime()).toBe(1542659294284);
});

test('gotoLive() seeks a live stream to the live edge, but has no effect on on demand streams.', () => {
  {
    const { streamRangeHelper, rxPlayer } = setup({
      live: true,
      position: 400,
      minimumPosition: 123,
      maximumPosition: 789
    });
    streamRangeHelper.gotoLive();
    expect(rxPlayer.seekTo).toHaveBeenCalledWith(789);
  }
  {
    const { streamRangeHelper, rxPlayer } = setup({
      live: false,
      position: 400,
      minimumPosition: 123,
      maximumPosition: 789
    });
    streamRangeHelper.gotoLive();
    expect(rxPlayer.seekTo).not.toHaveBeenCalled();
  }
});

test('setPosition() seeks within a live stream relatively to minimumPosition.', () => {
  const { streamRangeHelper, rxPlayer } = setup({
    live: true,
    position: 400,
    minimumPosition: 123,
    maximumPosition: 789
  });
  streamRangeHelper.setPosition(500);
  expect(rxPlayer.seekTo).toHaveBeenCalledWith(623);
});

test('setPosition() seeks within an on demand stream.', () => {
  const { streamRangeHelper, rxPlayer } = setup({ live: false, position: 400 });
  streamRangeHelper.setPosition(200);
  expect(rxPlayer.seekTo).toHaveBeenCalledWith(200);
});

test('setPosition() is deactivated when player state is RELOADING.', () => {
  const { streamRangeHelper, rxPlayer } = setup({ live: false, position: 400, playerState: 'RELOADING' });
  streamRangeHelper.setPosition(200);
  expect(rxPlayer.seekTo).not.toHaveBeenCalled();
});

test('adjustForDvrStartOffset() adjusts playback position when paused, keeping it within the playable range.', () => {
  {
    const { streamRangeHelper, rxPlayer } = setup({
      live: true,
      position: 120,
      minimumPosition: 123,
      maximumPosition: 789,
      playerState: 'PAUSED'
    });
    streamRangeHelper.adjustForDvrStartOffset();
    expect(rxPlayer.seekTo).toHaveBeenCalledWith(133);
  }
  {
    const { streamRangeHelper, rxPlayer } = setup({
      live: true,
      position: 120,
      minimumPosition: 123,
      maximumPosition: 789,
      playerState: 'PLAYING'
    });
    streamRangeHelper.adjustForDvrStartOffset();
    expect(rxPlayer.seekTo).not.toHaveBeenCalled();
  }
  {
    const { streamRangeHelper, rxPlayer } = setup({
      live: false,
      position: 120,
      minimumPosition: 123,
      maximumPosition: 789,
      playerState: 'PAUSED'
    });
    streamRangeHelper.adjustForDvrStartOffset();
    expect(rxPlayer.seekTo).not.toHaveBeenCalled();
  }
  {
    const { streamRangeHelper, rxPlayer } = setup({
      live: true,
      position: 130,
      minimumPosition: 123,
      maximumPosition: 789,
      playerState: 'PAUSED'
    });
    streamRangeHelper.adjustForDvrStartOffset();
    expect(rxPlayer.seekTo).not.toHaveBeenCalled();
  }
});
