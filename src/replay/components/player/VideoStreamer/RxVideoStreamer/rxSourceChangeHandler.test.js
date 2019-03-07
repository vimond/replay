import getSourceChangeHandler from './rxSourceChangeHandler';

function MockRxPlayer() {
  return {
    loadVideo: jest.fn(),
    stop: jest.fn()
  };
}

const fetchMock = jest.fn((url, options) => {
  return Promise.resolve({ ok: true, status: 200, arrayBuffer: () => Promise.resolve(new ArrayBuffer(16)) });
});

global.fetch = fetchMock;

Object.defineProperty(navigator, 'userAgent', { enumerable: true, writable: true });
navigator.userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36';

test('handleSourceChange() invokes loadVideo() on Rx-player when a source is specified.', () => {
  const source1 = {
    streamUrl: 'https://example.com/smooth-stream',
    contentType: 'application/vnd.ms-sstr+xml'
  };
  const source2 = {
    streamUrl: 'https://example.com/dash.mpd',
    contentType: 'application/dash+xml',
    startPosition: 123
  };
  const mockRxPlayer = new MockRxPlayer();
  const handleSourceChange = getSourceChangeHandler(mockRxPlayer);
  handleSourceChange({ source: source1 });
  expect(mockRxPlayer.loadVideo).toHaveBeenCalledWith({
    transport: 'smooth',
    url: 'https://example.com/smooth-stream',
    autoPlay: true
  });
  handleSourceChange({ source: source2 });
  expect(mockRxPlayer.loadVideo).toHaveBeenCalledWith({
    transport: 'dash',
    url: 'https://example.com/dash.mpd',
    startAt: { position: 123 },
    autoPlay: true
  });
  handleSourceChange({ source: source1, initialPlaybackProps: { isPaused: true } });
  expect(mockRxPlayer.loadVideo).toHaveBeenCalledWith({
    transport: 'smooth',
    url: 'https://example.com/smooth-stream',
    autoPlay: false
  });
});

test('handleSourceChange() invokes stop() on Rx-player when a null source is specified.', () => {
  const source1 = {
    streamUrl: 'https://example.com/smooth-stream',
    contentType: 'application/vnd.ms-sstr+xml'
  };
  const mockRxPlayer = new MockRxPlayer();
  const handleSourceChange = getSourceChangeHandler(mockRxPlayer);
  handleSourceChange(source1);
  handleSourceChange({ source: null });
  expect(mockRxPlayer.stop).toHaveBeenCalled();
});

test('handleSourceChange() throws an error if the stream type is not specified in the source.', () => {
  const source = {
    streamUrl: 'https://example.com/smooth-stream',
    startPosition: 123
  };
  const mockRxPlayer = new MockRxPlayer();
  const handleSourceChange = getSourceChangeHandler(mockRxPlayer);
  expect(handleSourceChange({ source })).rejects.toMatchObject({
    code: 'STREAM_ERROR_TECHNOLOGY_UNSUPPORTED',
    technology: 'rxplayer'
  });
});

test(
  'handleSourceChange() provides a license acquisition callback returning a promise for the license. Both PlayReady ' +
    'and Widevine is covered, regardless of browser.',
  () => {
    const source = {
      streamUrl: 'https://example.com/dash.mpd',
      contentType: 'application/dash+xml',
      licenseUrl: 'https://example.com/license',
      licenseAcquisitionDetails: {
        licenseRequestHeaders: {
          Authorization: 'Very secret token'
        },
        widevineServiceCertificateUrl: 'https://example.com/certificate/widevine'
      }
    };
    const mockRxPlayer = new MockRxPlayer();
    const handleSourceChange = getSourceChangeHandler(mockRxPlayer);
    return handleSourceChange({ source }).then(() => {
      const keySystems = mockRxPlayer.loadVideo.mock.calls[0][0].keySystems;
      expect(keySystems.length).toBe(2);
      const playReadyKs = keySystems.filter(ks => ks.type === 'playready')[0];
      const widevineKs = keySystems.filter(ks => ks.type === 'widevine')[0];

      expect(fetchMock).toHaveBeenCalledWith('https://example.com/certificate/widevine');
      expect(widevineKs.serverCertificate.byteLength).toBe(16);

      fetchMock.mockClear();
      const challenge = new Uint8Array(8);
      return playReadyKs.getLicense(challenge, 'license-request').then(result => {
        expect(fetchMock).toHaveBeenCalledWith('https://example.com/license', {
          method: 'POST',
          body: challenge,
          headers: { Authorization: 'Very secret token' }
        });
        expect(result.byteLength).toBe(16);
        fetchMock.mockClear();
        return widevineKs.getLicense(challenge, 'license-request').then(result => {
          expect(fetchMock).toHaveBeenCalledWith('https://example.com/license', {
            method: 'POST',
            body: challenge,
            headers: { Authorization: 'Very secret token' }
          });
          expect(result.byteLength).toBe(16);
        });
      });
    });
  }
);
