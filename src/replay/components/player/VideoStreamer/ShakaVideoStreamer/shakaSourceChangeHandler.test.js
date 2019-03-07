import getSourceChangeHandler from './shakaSourceChangeHandler';

function MockShakaPlayer() {
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
  const handleSourceChange = getSourceChangeHandler(shakaPlayer);
  const firstSource = { streamUrl: 'https://ok.com/puter', startPosition: 33 };
  const secondSource = { streamUrl: 'https://example.com/stream' };
  return handleSourceChange({ source: firstSource }, {})
    .then(() => expect(shakaPlayer.load.mock.calls[0]).toEqual(['https://ok.com/puter', 33]))
    .then(() => handleSourceChange({ source: secondSource }, { source: firstSource }))
    .then(() => expect(shakaPlayer.load.mock.calls[1]).toEqual(['https://example.com/stream', undefined]));
});

test('Shaka helper handleSourceChange() treats a string source and an object source with property streamUrl identically.', () => {
  const shakaPlayer = new MockShakaPlayer();
  const handleSourceChange = getSourceChangeHandler(shakaPlayer);
  const stringSource = 'https://example.com/stream';
  return handleSourceChange({ source: stringSource }, {}).then(() =>
    expect(shakaPlayer.load.mock.calls[0]).toEqual(['https://example.com/stream', undefined])
  );
});

test('Shaka helper handleSourceChange() unregisters earlier filters when a source is loaded.', () => {
  const shakaPlayer = new MockShakaPlayer();
  const handleSourceChange = getSourceChangeHandler(shakaPlayer);
  const firstSource = { streamUrl: 'https://ok.com/puter', startPosition: 33 };
  const secondSource = { streamUrl: 'https://example.com/stream' };
  return handleSourceChange({ source: firstSource }, {})
    .then(() => {
      expect(shakaPlayer.getNetworkingEngine().clearAllRequestFilters).toHaveBeenCalledTimes(1);
      expect(shakaPlayer.getNetworkingEngine().clearAllResponseFilters).toHaveBeenCalledTimes(1);
    })
    .then(() => handleSourceChange({ source: secondSource }, { source: firstSource }))
    .then(() => {
      expect(shakaPlayer.getNetworkingEngine().clearAllRequestFilters).toHaveBeenCalledTimes(2);
      expect(shakaPlayer.getNetworkingEngine().clearAllResponseFilters).toHaveBeenCalledTimes(2);
    });
});
test('Custom request or response filters are registered.', () => {
  const shakaPlayer = new MockShakaPlayer();
  const handleSourceChange = getSourceChangeHandler(shakaPlayer);
  const firstSource = { streamUrl: 'https://ok.com/puter', startPosition: 33 };
  const shakaRequestFilter = 1;
  const shakaResponseFilter = 2;
  return handleSourceChange({ source: firstSource, shakaRequestFilter, shakaResponseFilter }, {}).then(() => {
    expect(shakaPlayer.getNetworkingEngine().registerRequestFilter).toHaveBeenCalledTimes(1);
    expect(shakaPlayer.getNetworkingEngine().registerResponseFilter).toHaveBeenCalledTimes(1);
  });
});
test('Shaka helper handleSourceChange() unloads the current source if changing into a nullish source prop. It also unregisters filters.', () => {
  const shakaPlayer = new MockShakaPlayer();
  const handleSourceChange = getSourceChangeHandler(shakaPlayer);
  const firstSource = { streamUrl: 'https://ok.com/puter', startPosition: 33 };
  return handleSourceChange({ source: firstSource }, {})
    .then(() => handleSourceChange({}, { source: firstSource }))
    .then(() => {
      expect(shakaPlayer.getNetworkingEngine().clearAllRequestFilters).toHaveBeenCalledTimes(2);
      expect(shakaPlayer.getNetworkingEngine().clearAllResponseFilters).toHaveBeenCalledTimes(2);
      expect(shakaPlayer.unload).toHaveBeenCalledTimes(1);
    });
});

test('Shaka helper handleSourceChange() configures DRM if source specifies it.', () => {
  const shakaPlayer = new MockShakaPlayer();
  const handleSourceChange = getSourceChangeHandler(shakaPlayer);
  const firstSource = {
    streamUrl: 'https://ok.com/puter',
    startPosition: 33,
    licenseUrl: 'https://example.com/license'
  };
  return handleSourceChange(
    {
      source: firstSource,
      configuration: { licenseAcquisition: { widevine: { serviceCertificateUrl: 'https://example.com/certificate' } } }
    },
    {}
  ).then(() => {
    expect(shakaPlayer.load.mock.calls[0]).toEqual(['https://ok.com/puter', 33]);
    const drmConfig = shakaPlayer.configure.mock.calls[0][0];
    expect(drmConfig).toMatchObject({
      drm: {
        servers: {
          'com.widevine.alpha': 'https://example.com/license',
          'com.microsoft.playready': 'https://example.com/license'
        },
        advanced: {
          'com.widevine.alpha': {
            audioRobustness: 'SW_SECURE_CRYPTO',
            videoRobustness: 'SW_SECURE_DECODE',
            serverCertificate: 'https://example.com/certificate'
          },
          'com.microsoft.playready': {
            videoRobustness: 'SW_SECURE_DECODE',
            audioRobustness: 'SW_SECURE_CRYPTO'
          }
        }
      }
    });
  });
});
