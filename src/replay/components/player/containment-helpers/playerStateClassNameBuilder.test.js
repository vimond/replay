import playerStateClassNameBuilder from './playerStateClassNameBuilder';
import type { RecognizedPlayerStateProperties } from './playerStateClassNameBuilder';

const plainBooleanProps = ['isSeeking', 'isBuffering', 'isMuted', 'isAtLiveEdge', 'isFullscreen'];
const classNamePrefix = 'v-';

const allProps: RecognizedPlayerStateProperties = {
  isPaused: true,
  isSeeking: false,
  isBuffering: true,
  isMuted: false,
  volume: 0.2,
  isAtLiveEdge: true,
  playState: 'buffering',
  playMode: 'livedvr',
  error: null,
  isFullscreen: true,
  isUserActive: false
};

const classNameDefs = {
  volumePrefix: 'volume-',
  isFullscreen: 'is-fullscreen',
  isUserActive: 'is-user-active',
  isUserInactive: 'is-user-inactive',
  isBuffering: 'is-buffering',
  isSeeking: 'is-seeking',
  isPlaying: 'is-playing',
  isPaused: 'is-paused',
  isStarting: 'is-starting',
  isMuted: 'is-muted',
  isAtLiveEdge: 'is-at-live-edge',
  isLive: 'is-live',
  isOnDemand: 'is-on-demand',
  isDvrEnabled: 'is-dvr-enabled',
  isFailed: 'is-failed'
};

test('playerStateClassNameBuilder() returns no class names if no definitions are provided.', () => {
  const result = playerStateClassNameBuilder(allProps, null, classNamePrefix);
  expect(result).toBe('');
  const result2 = playerStateClassNameBuilder(allProps, {}, classNamePrefix);
  expect(result2).toBe('');
});

test('playerStateClassNameBuilder() returns no class names if no props are defined.', () => {
  const result = playerStateClassNameBuilder({}, classNameDefs, classNamePrefix);
  expect(result).toBe('');
});

test('playerStateClassNameBuilder() maps boolean props mainly 1:1 to included class names.', () => {
  const result = playerStateClassNameBuilder(allProps, classNameDefs, classNamePrefix);
  plainBooleanProps.forEach(key => {
    if (allProps[key]) {
      expect(result.indexOf(classNamePrefix + classNameDefs[key])).toBeGreaterThanOrEqual(0);
    } else {
      expect(result.indexOf(classNamePrefix + classNameDefs[key])).toBeLessThan(0);
    }
  });
  const allTrue = {};
  const allFalse = {};
  plainBooleanProps.forEach(key => {
    allTrue[key] = true;
    allFalse[key] = false;
  });

  const allTrueResult = playerStateClassNameBuilder(allTrue, classNameDefs, classNamePrefix);
  plainBooleanProps.forEach(key => {
    expect(allTrueResult.indexOf(classNamePrefix + classNameDefs[key])).toBeGreaterThanOrEqual(0);
  });
  const allFalseResult = playerStateClassNameBuilder(allFalse, classNameDefs, classNamePrefix);
  plainBooleanProps.forEach(key => {
    expect(allFalseResult.indexOf(classNamePrefix + classNameDefs[key])).toBeLessThan(0);
  });
});

test('playerStateClassNameBuilder() includes class names for both true and false isPaused, and isUserActive props', () => {
  const isPausedTrueResult = playerStateClassNameBuilder(
    { isPaused: true, playState: 'seeking' },
    classNameDefs,
    classNamePrefix
  );
  expect(isPausedTrueResult).toBe('v-is-paused');
  const isPausedFalseResult = playerStateClassNameBuilder(
    { isPaused: false, playState: 'buffering' },
    classNameDefs,
    classNamePrefix
  );
  expect(isPausedFalseResult).toBe('v-is-playing');

  const isUserActiveTrueResult = playerStateClassNameBuilder({ isUserActive: true }, classNameDefs, classNamePrefix);
  expect(isUserActiveTrueResult).toBe('v-is-user-active');
  const isUserActiveFalseResult = playerStateClassNameBuilder({ isUserActive: false }, classNameDefs, classNamePrefix);
  expect(isUserActiveFalseResult).toBe('v-is-user-inactive');
});

test('playerStateClassNameBuilder() sets correct class names from the playMode prop.', () => {
  const onDemandResult = playerStateClassNameBuilder({ playMode: 'ondemand' }, classNameDefs, classNamePrefix);
  expect(onDemandResult).toBe('v-is-on-demand');
  const liveResult = playerStateClassNameBuilder({ playMode: 'live' }, classNameDefs, classNamePrefix);
  expect(liveResult).toBe('v-is-live');
  const liveDvrResult = playerStateClassNameBuilder({ playMode: 'livedvr' }, classNameDefs, classNamePrefix);
  expect(liveDvrResult.indexOf('v-is-live')).toBeGreaterThanOrEqual(0);
  expect(liveDvrResult.indexOf('v-is-dvr-enabled')).toBeGreaterThanOrEqual(0);
  expect(liveDvrResult.indexOf('v-is-on-demand')).toBeLessThan(0);
});

test('playerStateClassNameBuilder() recognizes the playState "starting" and sets a class name.', () => {
  const startingResult = playerStateClassNameBuilder({ playState: 'starting' }, classNameDefs, '');
  expect(startingResult).toBe('is-starting');
  const playingResult = playerStateClassNameBuilder({ playState: 'playing' }, classNameDefs, '');
  expect(playingResult).toBe('');
});

test('playerStateClassNameBuilder() sets prefixed volume class names for low/medium/high according to current volume level between 0 and 1.', () => {
  const lowResult = playerStateClassNameBuilder(allProps, classNameDefs, classNamePrefix);
  expect(lowResult.indexOf('v-volume-low')).toBeGreaterThanOrEqual(0);
  expect(lowResult.indexOf('v-volume-medium')).toBeLessThan(0);
  expect(lowResult.indexOf('v-volume-high')).toBeLessThan(0);

  const mediumResult = playerStateClassNameBuilder({ volume: 0.45 }, classNameDefs, classNamePrefix);
  expect(mediumResult.indexOf('v-volume-low')).toBeLessThan(0);
  expect(mediumResult.indexOf('v-volume-medium')).toBeGreaterThanOrEqual(0);
  expect(mediumResult.indexOf('v-volume-high')).toBeLessThan(0);

  const highResult = playerStateClassNameBuilder({ volume: 0.77 }, classNameDefs, classNamePrefix);
  expect(highResult.indexOf('v-volume-low')).toBeLessThan(0);
  expect(highResult.indexOf('v-volume-medium')).toBeLessThan(0);
  expect(highResult.indexOf('v-volume-high')).toBeGreaterThanOrEqual(0);
});

test('playerStateClassNameBuilder() sets the prefixed volume class names also for the exact volume levels 0 and 1', () => {
  const zeroResult = playerStateClassNameBuilder({ volume: 0 }, classNameDefs, classNamePrefix);
  expect(zeroResult.indexOf('v-volume-low')).toBeGreaterThanOrEqual(0);
  expect(zeroResult.indexOf('v-volume-medium')).toBeLessThan(0);
  expect(zeroResult.indexOf('v-volume-high')).toBeLessThan(0);

  const oneResult = playerStateClassNameBuilder({ volume: 1 }, classNameDefs, classNamePrefix);
  expect(oneResult.indexOf('v-volume-low')).toBeLessThan(0);
  expect(oneResult.indexOf('v-volume-medium')).toBeLessThan(0);
  expect(oneResult.indexOf('v-volume-high')).toBeGreaterThanOrEqual(0);
});

test('playerStateClassNameBuilder() always includes and prefixes extra class names.', () => {
  const fullResult = playerStateClassNameBuilder(allProps, classNameDefs, classNamePrefix, ['news', 'sports']);
  expect(fullResult.indexOf('v-sports')).toBeGreaterThanOrEqual(0);
  expect(fullResult.indexOf('v-news')).toBeGreaterThanOrEqual(0);

  const noStateResult = playerStateClassNameBuilder({}, classNameDefs, classNamePrefix, ['news', 'sports']);
  expect(noStateResult.indexOf('v-sports')).toBeGreaterThanOrEqual(0);
  expect(noStateResult.indexOf('v-news')).toBeGreaterThanOrEqual(0);
});
