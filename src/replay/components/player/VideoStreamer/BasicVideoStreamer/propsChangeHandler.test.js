import processPropChanges from './propsChangeHandler';

const getVideoElementMock = () => ({
  play: jest.fn(),
  pause: jest.fn(),
  currentTime: 0,
  duration: NaN,
  volume: 0.8,
  muted: false
});

const getInitialProps = () => ({
  volume: 0.5,
  configuration: {},
  source: { streamUrl: 'https://a.b' },
  className: 'abc',
  onReady: () => {},
  onStreamStateChange: () => {}
});

test('videoUpdater plays or pauses the video according to the isPaused prop being specified with a different value.', () => {
  const videoRef = { current: getVideoElementMock() };
  const initialProps = getInitialProps();
  const propsUpdate1 = { ...initialProps, isPaused: true };
  const propsUpdate2 = { ...initialProps, isMuted: true }; // isPaused is unspecified.
  const propsUpdate3 = { ...initialProps, isPaused: false };

  processPropChanges(videoRef, null, initialProps, propsUpdate1);
  expect(videoRef.current.play).not.toHaveBeenCalled();
  expect(videoRef.current.pause).toHaveBeenCalledTimes(1);

  processPropChanges(videoRef, null, initialProps, propsUpdate2);
  expect(videoRef.current.play).not.toHaveBeenCalled();
  expect(videoRef.current.pause).toHaveBeenCalledTimes(1);

  processPropChanges(videoRef, null, initialProps, propsUpdate3);
  expect(videoRef.current.pause).toHaveBeenCalledTimes(1);
  expect(videoRef.current.play).toHaveBeenCalledTimes(1);
});
test('videoUpdater mutes, unmutes, and adjusts the volume according to isMuted and volume properties being set.', () => {
  const videoRef = { current: getVideoElementMock() };
  const initialProps = getInitialProps();
  const propsUpdate1 = { ...initialProps, volume: 1 };
  const propsUpdate2 = { ...initialProps, isMuted: true };
  const propsUpdate3 = { ...initialProps, isMuted: false };
  const propsUpdate4 = { ...initialProps, volume: 0 };

  processPropChanges(videoRef, null, initialProps, propsUpdate1);
  expect(videoRef.current.volume).toBe(1);
  expect(videoRef.current.muted).toBe(false);

  processPropChanges(videoRef, null, initialProps, propsUpdate2);
  expect(videoRef.current.volume).toBe(1);
  expect(videoRef.current.muted).toBe(true);

  processPropChanges(videoRef, null, initialProps, propsUpdate3);
  expect(videoRef.current.volume).toBe(1);
  expect(videoRef.current.muted).toBe(false);

  processPropChanges(videoRef, null, initialProps, propsUpdate3); // Repeated, should be idempotent or whatever it is called.
  expect(videoRef.current.volume).toBe(1);
  expect(videoRef.current.muted).toBe(false);

  processPropChanges(videoRef, null, initialProps, propsUpdate4);
  expect(videoRef.current.volume).toBe(0);
  expect(videoRef.current.muted).toBe(false);
});
