import { handleSourceChange } from './helpers';
import shaka from 'shaka-player';

function MockShakaPlayer(videoElement) {
  const networkingEngine = {
    clearAllRequestFilters: jest.fn(),
    clearAllResponseFilters: jest.fn(),
    registerRequestFilter: jest.fn(),
    registerResponseFilter: jest.fn()
  };
  return {
    getNetworkingEngine: () => networkingEngine,
    load: jest.fn().mockImplementation(() => Promise.resolve()),
    unload: jest.fn().mockImplementation(() => Promise.resolve()),
    destroy: jest.fn().mockImplementation(() => Promise.resolve()),
    configure: jest.fn()
  };
}

test('Shaka helper handleSourceChange() loads a new source if specified in updated props.', () => {
  const shakaPlayer = new MockShakaPlayer();
  const firstSource = { streamUrl: 'https://ok.com/puter', startPosition: 33 };
  const secondSource = { streamUrl: 'https://example.com/stream' };
  return handleSourceChange(shakaPlayer, firstSource, null)
    .then(() => expect(shakaPlayer.load.mock.calls[0]).toEqual(['https://ok.com/puter', 33]))
    .then(() => handleSourceChange(shakaPlayer, secondSource, firstSource))
    .then(() => expect(shakaPlayer.load.mock.calls[1]).toEqual(['https://example.com/stream', undefined]));
});

test('Shaka helper handleSourceChange() treats a string source and an object source with property streamUrl identically.', () => {
  const shakaPlayer = new MockShakaPlayer();
  const stringSource = 'https://example.com/stream';
  return handleSourceChange(shakaPlayer, stringSource, null).then(() =>
    expect(shakaPlayer.load.mock.calls[0]).toEqual(['https://example.com/stream', undefined])
  );
});

test('Shaka helper handleSourceChange() unregisters earlier filters and (re-)registers built-in filter when a source is loaded.', () => {
  const shakaPlayer = new MockShakaPlayer();
  const firstSource = { streamUrl: 'https://ok.com/puter', startPosition: 33 };
  const secondSource = { streamUrl: 'https://example.com/stream' };
  return handleSourceChange(shakaPlayer, firstSource, null)
    .then(() => {
      expect(shakaPlayer.getNetworkingEngine().clearAllRequestFilters).toHaveBeenCalledTimes(1);
      expect(shakaPlayer.getNetworkingEngine().clearAllResponseFilters).toHaveBeenCalledTimes(1);
      expect(typeof shakaPlayer.getNetworkingEngine().registerResponseFilter.mock.calls[0][0]).toBe('function');
    })
    .then(() => handleSourceChange(shakaPlayer, secondSource, firstSource))
    .then(() => {
      expect(shakaPlayer.getNetworkingEngine().clearAllRequestFilters).toHaveBeenCalledTimes(2);
      expect(shakaPlayer.getNetworkingEngine().clearAllResponseFilters).toHaveBeenCalledTimes(2);
      expect(typeof shakaPlayer.getNetworkingEngine().registerResponseFilter.mock.calls[1][0]).toBe('function');
    });
});
test('The built-in filter reports back a date with the value of availabilityStartTime, if found in a manifest response.', () => {
  const shakaPlayer = new MockShakaPlayer();
  const firstSource = { streamUrl: 'https://ok.com/puter', startPosition: 33 };
  const handleAvailabilityStartTime = jest.fn();
  return handleSourceChange(shakaPlayer, firstSource, null, null, null, handleAvailabilityStartTime).then(() => {
    const responseFilter = shakaPlayer.getNetworkingEngine().registerResponseFilter.mock.calls[0][0];
    responseFilter(
      shaka.net.NetworkingEngine.RequestType.MANIFEST,
      { data: '<?xml version="1.0"?><MPD></MPD>' }
    );
    responseFilter(
      shaka.net.NetworkingEngine.RequestType.MANIFEST,
      { data: '<?xml version="1.0"?><MPD type="dynamic" availabilityStartTime="2016-09-08T13:02:55Z"></MPD>' }
    );
    responseFilter(
      shaka.net.NetworkingEngine.RequestType.MANIFEST,
      { data: '<?xml version="1.0"?><MPD type="dynamic" availabilityStartTime="2016-09-08T13:02:55Z"></MPD>' }
    );
    responseFilter(
      shaka.net.NetworkingEngine.RequestType.MANIFEST,
      { data: '<?xml version="1.0"?><MPD type="static"></MPD>' }
    );
    expect(handleAvailabilityStartTime).toHaveBeenCalledTimes(1);
    expect(handleAvailabilityStartTime.mock.calls[0][0].getTime()).toBe(1473339775000);
  });
});
test('Custom request or response filters are registered.', () => {
  const shakaPlayer = new MockShakaPlayer();
  const firstSource = { streamUrl: 'https://ok.com/puter', startPosition: 33 };
  const requestFilter = 1;
  const responseFilter = 2;
  return handleSourceChange(shakaPlayer, firstSource, null, requestFilter, responseFilter)
    .then(() => {
      expect(shakaPlayer.getNetworkingEngine().registerRequestFilter).toHaveBeenCalledTimes(1);
      expect(shakaPlayer.getNetworkingEngine().registerResponseFilter).toHaveBeenCalledTimes(2);
      expect(shakaPlayer.getNetworkingEngine().registerRequestFilter).toHaveBeenCalledWith(1);
      expect(shakaPlayer.getNetworkingEngine().registerResponseFilter).toHaveBeenCalledWith(2);
    })
});
test('Shaka helper handleSourceChange() unloads the current source if changing into a nullish source prop. It also unregisters filters.', () => {
  const shakaPlayer = new MockShakaPlayer();
  const firstSource = { streamUrl: 'https://ok.com/puter', startPosition: 33 };
  return handleSourceChange(shakaPlayer, firstSource, null)
    .then(() => handleSourceChange(shakaPlayer, null, firstSource))
    .then(() => {
      expect(shakaPlayer.getNetworkingEngine().clearAllRequestFilters).toHaveBeenCalledTimes(2);
      expect(shakaPlayer.getNetworkingEngine().clearAllResponseFilters).toHaveBeenCalledTimes(2);
      expect(shakaPlayer.unload).toHaveBeenCalledTimes(1);
    });
});
