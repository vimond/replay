import { PlaybackError } from '../types';
import getBasicVideoEventHandlers from './basicVideoEventHandlers';
import getPlaybackLifeCycleManager, { emptyTracks } from '../common/playbackLifeCycleManager';
import { getArrayLogger } from '../common/logger';
import getFilteredPropertyUpdater from '../common/filteredPropertyUpdater';
import getStreamRangeHelper from './streamRangeHelper';

const getPropertyUpdates = (mockFn, key) => mockFn.mock.calls.filter(call => key in call[0]).map(call => call[0]);

const addProperties = (obj, properties) => {
  Object.entries(properties).forEach(([key, value]) => {
    obj[key] = value;
  });
};

function setup(onStreamStateChange = jest.fn(), getStreamRangeHelper) {
  const videoElement = { volume: 1, muted: false, play: () => {}, pause: () => {} };
  const streamer = {
    props: { onStreamStateChange }
  };

  const applyProperties = jest.fn();
  const updateStreamState = getFilteredPropertyUpdater(streamer);

  const streamRangeHelper = getStreamRangeHelper
    ? getStreamRangeHelper(videoElement)
    : {
        calculateNewState: () => ({
          playMode: 'ondemand',
          isAtLivePosition: false,
          position: videoElement.currentTime,
          duration: videoElement.duration,
          absolutePosition: new Date(0),
          absoluteStartPosition: new Date(0)
        }),
        adjustForDvrStartOffset: () => {}
      };

  const basicHandlers = getBasicVideoEventHandlers({
    streamer,
    videoElement,
    streamRangeHelper,
    configuration: { pauseUpdateInterval: 0.02 },
    applyProperties,
    updateStreamState
  });
  const { videoElementEventHandlers, setLifeCycleManager } = basicHandlers;

  const playbackLifeCycleManager = getPlaybackLifeCycleManager(
    updateStreamState,
    basicHandlers.pauseStreamRangeUpdater,
    getArrayLogger(window, 'lifecycle').log
  );
  setLifeCycleManager(playbackLifeCycleManager);

  playbackLifeCycleManager.startPlaybackSession();
  addProperties(videoElement, videoElementEventHandlers);

  return {
    playbackLifeCycleManager,
    streamer,
    videoElement,
    onStreamStateChange,
    setProps: function(newProps) {
      addProperties(streamer.props, newProps);
    }
  };
}

const runStartToLoadedSequence = videoElement => {
  videoElement.onLoadStart();
  videoElement.onWaiting();
  videoElement.onLoadedMetadata();
  videoElement.onDurationChange();
};

const runStartAsPausedSequence = videoElement => {
  runStartToLoadedSequence(videoElement);
  videoElement.onCanPlay();
};

const runStartAsPlayingSequence = videoElement => {
  runStartAsPausedSequence(videoElement);
  videoElement.onPlaying();
};

const runStartAsPausedAtStartPositionSequence = videoElement => {
  runStartToLoadedSequence(videoElement);
  videoElement.onSeeking();
  videoElement.onTimeUpdate();
  videoElement.onSeeked();
  videoElement.onSeeked();
  videoElement.onCanPlay();
};

const runStartAsPlayingAtStartPositionSequence = videoElement => {
  runStartAsPausedAtStartPositionSequence(videoElement);
  videoElement.onPlaying();
};

const runBufferingWhilePlayingSequence = videoElement => {
  videoElement.onStalled(); // Also testing alternative event.
  videoElement.onCanPlay();
  videoElement.onPlaying();
};

const runBufferingWhilePausedSequence = videoElement => {
  videoElement.onWaiting();
  videoElement.onCanPlay();
};

const runSeekingWhilePausedSequence = videoElement => {
  videoElement.onSeeking();
  videoElement.onSeeked();
  videoElement.onCanPlay();
};

const runSeekingWhilePlayingSequence = videoElement => {
  // The video element is always paused before seeking starts.
  videoElement.paused = true;
  videoElement.onPause();
  videoElement.onSeeking();
  videoElement.onSeeked();
  videoElement.onCanPlay();
  videoElement.onPlaying();
};

const runEndSequence = videoElement => {
  videoElement.onPause();
  videoElement.onEnded();
};

const runChangeToPauseSequence = videoElement => {
  videoElement.paused = true;
  videoElement.onPause();
};

const runChangeToPlayingSequence = videoElement => {
  videoElement.paused = false;
  videoElement.onPlaying();
};

const runCommonPlaybackSequences = videoElement => {
  runBufferingWhilePlayingSequence(videoElement);
  runChangeToPauseSequence(videoElement);
  runBufferingWhilePausedSequence(videoElement);
  runSeekingWhilePausedSequence(videoElement);
  runChangeToPlayingSequence(videoElement);
  runSeekingWhilePlayingSequence(videoElement);
  runEndSequence(videoElement);
};

test('streamStateUpdater reports an initial state of properties.', () => {
  const { onStreamStateChange } = setup();
  expect(onStreamStateChange).toHaveBeenCalledWith({ duration: 0 });
  expect(onStreamStateChange).toHaveBeenCalledWith({ position: 0 });
  expect(onStreamStateChange).toHaveBeenCalledWith({ playMode: 'ondemand' });
  expect(onStreamStateChange).toHaveBeenCalledWith({ playState: 'inactive' });
  expect(onStreamStateChange).toHaveBeenCalledWith({ isBuffering: false });
  expect(onStreamStateChange).toHaveBeenCalledWith({ isPaused: false });
  expect(onStreamStateChange).toHaveBeenCalledWith({ isSeeking: false });
  expect(onStreamStateChange).toHaveBeenCalledWith({ volume: 1 });
  expect(onStreamStateChange).toHaveBeenCalledWith({ muted: false });
  expect(onStreamStateChange).toHaveBeenCalledWith({ bufferedAhead: 0 });
  expect(onStreamStateChange).toHaveBeenCalledWith({ bitrates: emptyTracks });
  expect(onStreamStateChange).toHaveBeenCalledWith({ audioTracks: emptyTracks });
  expect(onStreamStateChange).toHaveBeenCalledWith({ textTracks: emptyTracks });
  expect(onStreamStateChange).toHaveBeenCalledWith({ absolutePosition: new Date(0) });
  expect(onStreamStateChange).toHaveBeenCalledWith({
    absoluteStartPosition: new Date(0)
  });
});

test('streamStateUpdater reports playMode "ondemand" and a duration when a video source is loaded.', () => {
  const { videoElement, onStreamStateChange } = setup();

  videoElement.duration = 313;
  videoElement.onLoadedMetadata();
  videoElement.onDurationChange();

  const durationUpdates = getPropertyUpdates(onStreamStateChange, 'duration');
  expect(durationUpdates).toHaveLength(2);
  expect(durationUpdates[0]).toEqual({ duration: 0 });
  expect(durationUpdates[1]).toEqual({ duration: 313 });

  const playModeUpdates = getPropertyUpdates(onStreamStateChange, 'playMode');
  expect(playModeUpdates).toHaveLength(1);
  expect(playModeUpdates[0]).toEqual({ playMode: 'ondemand' });
});

// streamRangeHelper actually has the responsibility of duration/position updates.
test('streamStateUpdater reports positions accordingly during playback.', () => {
  const { videoElement, onStreamStateChange } = setup();

  videoElement.currentTime = 121;
  videoElement.onTimeUpdate();
  videoElement.currentTime = 123;
  videoElement.onTimeUpdate();

  const positionUpdates = getPropertyUpdates(onStreamStateChange, 'position');
  expect(positionUpdates).toHaveLength(3);
  expect(positionUpdates[1]).toEqual({ position: 121 });
  expect(positionUpdates[2]).toEqual({ position: 123 });
});

test('streamStateUpdater reports playState for all different phases of a common playback.', () => {
  const { videoElement, onStreamStateChange } = setup();

  // 'inactive' | 'starting' | 'playing' | 'paused' | 'seeking' | 'buffering' | 'inactive'

  runStartAsPlayingSequence(videoElement);
  runCommonPlaybackSequences(videoElement);

  let updateNumber = 0;
  const playStateUpdates = getPropertyUpdates(onStreamStateChange, 'playState');

  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'inactive' });
  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'starting' });
  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'playing' });

  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'buffering' });
  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'playing' });

  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'paused' });

  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'buffering' });
  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'paused' });

  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'seeking' });
  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'paused' });

  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'playing' });
  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'paused' });
  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'seeking' });
  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'paused' });
  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'playing' });

  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'paused' });
  expect(playStateUpdates[updateNumber]).toEqual({ playState: 'inactive' });
});

test('streamStateUpdater reports correct playState sequence for a playback started as paused.', () => {
  const { videoElement, onStreamStateChange, setProps } = setup();

  setProps({ isPaused: true });
  videoElement.paused = true;

  runStartAsPausedSequence(videoElement);

  // Simulating the user resuming playing.
  videoElement.paused = false;
  videoElement.onPlaying();

  let updateNumber = 0;
  const playStateUpdates = getPropertyUpdates(onStreamStateChange, 'playState');

  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'inactive' });
  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'starting' });
  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'paused' });

  expect(playStateUpdates[updateNumber]).toEqual({ playState: 'playing' });
});

test('streamStateUpdater reports correct playState sequence for a playback started on a position > 0.', () => {
  const { videoElement, onStreamStateChange, setProps } = setup();

  setProps({ source: { startPosition: 5 } });

  runStartAsPlayingAtStartPositionSequence(videoElement);

  let updateNumber = 0;
  const playStateUpdates = getPropertyUpdates(onStreamStateChange, 'playState');

  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'inactive' });
  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'starting' });
  expect(playStateUpdates[updateNumber]).toEqual({ playState: 'playing' });
});

test('streamStateUpdater reports correct playState sequence for a playback started as paused on a position > 0.', () => {
  const { videoElement, onStreamStateChange, setProps } = setup();

  setProps({ isPaused: true, source: { startPosition: 5 } });
  videoElement.paused = true;

  runStartAsPausedAtStartPositionSequence(videoElement);

  let updateNumber = 0;
  const playStateUpdates = getPropertyUpdates(onStreamStateChange, 'playState');

  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'inactive' });
  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'starting' });
  expect(playStateUpdates[updateNumber]).toEqual({ playState: 'paused' });
});

test('streamStateUpdater reports correct playState sequence for a playback failing after started', () => {
  const { videoElement, onStreamStateChange, setProps } = setup();

  const onPlaybackError = jest.fn();
  setProps({ onPlaybackError });

  runStartAsPlayingSequence(videoElement);

  videoElement.error = new Error('It failed.');
  videoElement.onError();

  let updateNumber = 0;
  const playStateUpdates = getPropertyUpdates(onStreamStateChange, 'playState');

  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'inactive' });
  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'starting' });
  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'playing' });
  expect(playStateUpdates[updateNumber]).toEqual({ playState: 'inactive' });

  expect(onPlaybackError.mock.calls[0][0]).toBeInstanceOf(PlaybackError);
  expect(onPlaybackError.mock.calls.length).toBe(1);
});

test('streamStateUpdater reports correct playState sequence for a playback failing on startup', () => {
  const { videoElement, onStreamStateChange, setProps } = setup();

  const onPlaybackError = jest.fn();
  setProps({ onPlaybackError });

  // Start as playing.
  runStartToLoadedSequence(videoElement);
  videoElement.error = new Error('It failed.');
  videoElement.onError();

  let updateNumber = 0;
  const playStateUpdates = getPropertyUpdates(onStreamStateChange, 'playState');

  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'inactive' });
  expect(playStateUpdates[updateNumber++]).toEqual({ playState: 'starting' });
  expect(playStateUpdates[updateNumber]).toEqual({ playState: 'inactive' });
});

test('streamStateUpdater reports true for isSeeking, isBuffering, and isPaused for the different phases of a playback.', () => {
  const { videoElement, onStreamStateChange } = setup();

  runStartAsPlayingSequence(videoElement);

  const bufferingUpdates = getPropertyUpdates(onStreamStateChange, 'isBuffering');
  let seekingUpdates = getPropertyUpdates(onStreamStateChange, 'isSeeking');
  let pausedUpdates = getPropertyUpdates(onStreamStateChange, 'isPaused');

  expect(bufferingUpdates).toHaveLength(3);
  expect(seekingUpdates).toHaveLength(1);
  expect(pausedUpdates).toHaveLength(1);

  expect(bufferingUpdates[0]).toEqual({ isBuffering: false });
  expect(bufferingUpdates[1]).toEqual({ isBuffering: true });
  expect(bufferingUpdates[2]).toEqual({ isBuffering: false });

  onStreamStateChange.mockClear();

  runChangeToPauseSequence(videoElement);
  runChangeToPlayingSequence(videoElement);

  pausedUpdates = getPropertyUpdates(onStreamStateChange, 'isPaused');
  expect(pausedUpdates).toHaveLength(2);

  expect(pausedUpdates[0]).toEqual({ isPaused: true });
  expect(pausedUpdates[1]).toEqual({ isPaused: false });

  onStreamStateChange.mockClear();

  runSeekingWhilePlayingSequence(videoElement);

  // We should expect pausing states while seeking, according to real-life behaviour in browsers.
  seekingUpdates = getPropertyUpdates(onStreamStateChange, 'isSeeking');
  pausedUpdates = getPropertyUpdates(onStreamStateChange, 'isPaused');
  expect(seekingUpdates).toHaveLength(2);
  expect(pausedUpdates).toHaveLength(2);

  expect(seekingUpdates[0]).toEqual({ isSeeking: true });
  expect(seekingUpdates[1]).toEqual({ isSeeking: false });

  expect(pausedUpdates[0]).toEqual({ isPaused: true });
  expect(pausedUpdates[1]).toEqual({ isPaused: false });
});

test('streamStateUpdater reports volume and mute changes.', () => {
  const { videoElement, onStreamStateChange } = setup();
  videoElement.muted = false;
  videoElement.volume = 0.3;
  videoElement.onVolumeChange();
  videoElement.volume = 0.3;
  videoElement.onVolumeChange();
  videoElement.volume = 0.7;
  videoElement.onVolumeChange();
  videoElement.muted = true;
  videoElement.onVolumeChange();

  const volumeUpdates = getPropertyUpdates(onStreamStateChange, 'volume');
  const mutedUpdates = getPropertyUpdates(onStreamStateChange, 'isMuted');
  expect(volumeUpdates.map(u => u.volume)).toEqual([1, 0.3, 0.7]);
  expect(mutedUpdates.map(u => u.isMuted)).toEqual([false, true]);
});

test('streamStateUpdater reports bufferedAhead.', () => {
  const { videoElement, onStreamStateChange } = setup();

  const start = index => (index ? 48 : 12);
  const end = index => (index ? 60 : 24);

  // Nothing buffered.
  videoElement.buffered = { length: 0 };
  videoElement.currentTime = 13;
  videoElement.onProgress();

  // One buffer range.
  videoElement.buffered = { length: 1, start, end };
  videoElement.currentTime = 13;
  videoElement.onProgress();

  // Two buffer ranges:
  // First range.
  videoElement.buffered = { length: 2, start, end };
  videoElement.currentTime = 15;
  videoElement.onProgress();

  // Second range.
  videoElement.currentTime = 50;
  videoElement.onProgress();

  // Position outside ranges.
  videoElement.currentTime = 30;
  videoElement.onProgress();

  const bufferedAheadUpdates = getPropertyUpdates(onStreamStateChange, 'bufferedAhead');
  expect(bufferedAheadUpdates.map(u => u.bufferedAhead)).toEqual([0, 11, 9, 10, 0]);
});

test('streamStateUpdater reports an empty bitrates array, and no current bitrate, and locked or max bitrate.', () => {
  const { setProps, onStreamStateChange } = setup();
  expect(onStreamStateChange).toHaveBeenCalledWith({ bitrates: [] });

  setProps({ bitrateFix: 13 });
  expect(getPropertyUpdates(onStreamStateChange, 'bitrateFix')).toHaveLength(0);

  setProps({ maxBitrate: 13 });
  expect(getPropertyUpdates(onStreamStateChange, 'maxBitrate')).toHaveLength(0);

  expect(getPropertyUpdates(onStreamStateChange, 'currentBitrate')).toHaveLength(0);
});

test('If live stream playback pauses, start timer based updates of positions and play mode.', done => {
  const noop = () => {};
  const onUpdateDuringPaused = newState => {
    try {
      expect(newState).toMatchObject({
        position: 117
      });
      currentOp = noop;
      videoElement.onEnded();
      done();
    } catch (e) {
      done.fail(e);
      currentOp = noop;
      videoElement.onEnded();
    }
  };
  let currentOp = noop;

  const onStreamStateChange = newState => {
    currentOp(newState);
  };
  const { videoElement } = setup(onStreamStateChange, getStreamRangeHelper);
  videoElement.currentTime = 121;
  videoElement.duration = Infinity;
  videoElement.seekable = {
    length: 1,
    start: () => 13,
    end: () => 123
  };
  runStartAsPlayingSequence(videoElement);
  videoElement.paused = true;
  videoElement.onPause();
  currentOp = onUpdateDuringPaused;
  videoElement.currentTime = 130;
});

// Also tests streamRangeHelper.adjustForDvrStartOffset().
test('If live stream playback pauses and current position falls outside (before) DVR range, it should be adjusted.', done => {
  let isStarted = false;
  const expectations = [
    newState => {
      expect(newState).toMatchObject({
        position: 2
      });
      isStarted = false;
      videoElement.onEnded();
      done();
    },
    newState => {
      expect(newState).toMatchObject({
        position: 10
      });
      videoElement.seekable = {
        length: 1,
        start: () => 44,
        end: () => 133
      };
      videoElement.currentTime = 46;
    }
  ];

  const updateFn = newState => {
    try {
      if ('position' in newState && isStarted) {
        expectations.pop()(newState);
      }
    } catch (e) {
      done.fail(e);
    }
  };

  const { videoElement } = setup(updateFn, getStreamRangeHelper);
  videoElement.currentTime = 15;
  videoElement.duration = Infinity;
  videoElement.seekable = {
    length: 1,
    start: () => 23,
    end: () => 123
  };
  runStartAsPlayingSequence(videoElement);
  videoElement.paused = true;
  videoElement.onPause();
  isStarted = true;
});
