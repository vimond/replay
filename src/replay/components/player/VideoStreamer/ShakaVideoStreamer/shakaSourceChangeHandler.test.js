import getSourceChangeHandler from './shakaSourceChangeHandler';
import shaka from 'shaka-player';

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
  const handleSourceChange = getSourceChangeHandler(shaka, shakaPlayer);
  const firstSource = { streamUrl: 'https://ok.com/puter', startPosition: 33 };
  const secondSource = { streamUrl: 'https://example.com/stream' };
  return handleSourceChange({ source: firstSource }, {})
    .then(() => expect(shakaPlayer.load.mock.calls[0]).toEqual(['https://ok.com/puter', 33]))
    .then(() => handleSourceChange({ source: secondSource }, { source: firstSource }))
    .then(() => expect(shakaPlayer.load.mock.calls[1]).toEqual(['https://example.com/stream', undefined]));
});

test('Shaka helper handleSourceChange() treats a string source and an object source with property streamUrl identically.', () => {
  const shakaPlayer = new MockShakaPlayer();
  const handleSourceChange = getSourceChangeHandler(shaka, shakaPlayer);
  const stringSource = 'https://example.com/stream';
  return handleSourceChange({ source: stringSource }, {}).then(() =>
    expect(shakaPlayer.load.mock.calls[0]).toEqual(['https://example.com/stream', undefined])
  );
});

test('Shaka helper handleSourceChange() unregisters earlier filters when a source is loaded.', () => {
  const shakaPlayer = new MockShakaPlayer();
  const handleSourceChange = getSourceChangeHandler(shaka, shakaPlayer);
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
  const handleSourceChange = getSourceChangeHandler(shaka, shakaPlayer);
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
  const handleSourceChange = getSourceChangeHandler(shaka, shakaPlayer);
  const firstSource = { streamUrl: 'https://ok.com/puter', startPosition: 33 };
  return handleSourceChange({ source: firstSource }, {})
    .then(() => handleSourceChange({}, { source: firstSource }))
    .then(() => {
      expect(shakaPlayer.getNetworkingEngine().clearAllRequestFilters).toHaveBeenCalledTimes(2);
      expect(shakaPlayer.getNetworkingEngine().clearAllResponseFilters).toHaveBeenCalledTimes(2);
      expect(shakaPlayer.unload).toHaveBeenCalledTimes(1);
    });
});

test('Shaka helper handleSourceChange() configures DRM for the common schemes if source specifies a license URL.', () => {
  const shakaPlayer = new MockShakaPlayer();
  const handleSourceChange = getSourceChangeHandler(shaka, shakaPlayer);
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

test('Shaka helper handleSourceChange() configures DRM for the Widevine scheme if source specifies a license URL and its DRM type.', () => {
  const shakaPlayer = new MockShakaPlayer();
  const handleSourceChange = getSourceChangeHandler(shaka, shakaPlayer);
  const firstSource = {
    streamUrl: 'https://ok.com/puter',
    startPosition: 33,
    licenseUrl: 'https://example.com/license',
    drmType: 'com.widevine.alpha'
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
    expect(drmConfig.drm.servers).toEqual({
      'com.widevine.alpha': 'https://example.com/license'
    });
    expect(drmConfig.drm.advanced).toMatchObject({
      'com.widevine.alpha': {
        audioRobustness: 'SW_SECURE_CRYPTO',
        videoRobustness: 'SW_SECURE_DECODE',
        serverCertificate: 'https://example.com/certificate'
      }
    });
  });
});

test('Shaka helper handleSourceChange() applies custom robustness configuration for DRM schemes', () => {
  const shakaPlayer = new MockShakaPlayer();
  const handleSourceChange = getSourceChangeHandler(shaka, shakaPlayer);
  const configuration = {
    licenseAcquisition: {
      widevine: {
        serviceCertificateUrl: 'https://example.com/certificate',
        robustness: {
          audio: 'E',
          video: 'F'
        }
      },
      playReady: {
        robustness: {
          audio: 'G',
          video: 'H'
        }
      }
    }
  };
  const firstSource = {
    streamUrl: 'https://ok.com/puter',
    startPosition: 33,
    licenseUrl: 'https://example.com/license',
    licenseAcquisitionDetails: {
      robustness: {
        'com.widevine.alpha': {
          audio: 'A',
          video: 'B'
        },
        'com.microsoft.playready': {
          audio: 'C',
          video: 'D'
        }
      }
    }
  };
  return handleSourceChange({ source: firstSource, configuration }, {})
    .then(() => {
      expect(shakaPlayer.load.mock.calls[0]).toEqual(['https://ok.com/puter', 33]);
      const drmConfig = shakaPlayer.configure.mock.calls[0][0];
      expect(drmConfig.drm.advanced).toMatchObject({
        'com.widevine.alpha': {
          audioRobustness: 'A',
          videoRobustness: 'B',
          serverCertificate: 'https://example.com/certificate'
        },
        'com.microsoft.playready': {
          audioRobustness: 'C',
          videoRobustness: 'D'
        }
      });
    })
    .then(() => {
      const secondSource = {
        streamUrl: 'https://ok.com/puter',
        startPosition: 33,
        licenseUrl: 'https://example.com/license'
      };
      return handleSourceChange({ source: secondSource, configuration }, {}).then(() => {
        expect(shakaPlayer.load.mock.calls[1]).toEqual(['https://ok.com/puter', 33]);
        const drmConfig = shakaPlayer.configure.mock.calls[1][0];
        expect(drmConfig.drm.advanced).toMatchObject({
          'com.widevine.alpha': {
            audioRobustness: 'E',
            videoRobustness: 'F',
            serverCertificate: 'https://example.com/certificate'
          },
          'com.microsoft.playready': {
            audioRobustness: 'G',
            videoRobustness: 'H'
          }
        });
      });
    });
});

test('Shaka helper handleSourceChange() configures DRM for the PlayReady scheme if source specifies a license URL and the PlayReady DRM type.', () => {
  const shakaPlayer = new MockShakaPlayer();
  const handleSourceChange = getSourceChangeHandler(shaka, shakaPlayer);
  const firstSource = {
    streamUrl: 'https://ok.com/puter',
    startPosition: 33,
    licenseUrl: 'https://example.com/license',
    drmType: 'com.microsoft.playready'
  };
  return handleSourceChange(
    {
      source: firstSource
    },
    {}
  ).then(() => {
    expect(shakaPlayer.load.mock.calls[0]).toEqual(['https://ok.com/puter', 33]);
    const drmConfig = shakaPlayer.configure.mock.calls[0][0];
    expect(drmConfig.drm.servers).toEqual({
      'com.microsoft.playready': 'https://example.com/license'
    });
  });
});

test('Shaka helper handleSourceChange() configures DRM for the ClearKey scheme if source specifies a license URL and the ClearKey DRM type.', () => {
  const shakaPlayer = new MockShakaPlayer();
  const handleSourceChange = getSourceChangeHandler(shaka, shakaPlayer);
  const firstSource = {
    streamUrl: 'https://ok.com/puter',
    startPosition: 33,
    licenseUrl: 'https://example.com/license',
    drmType: 'org.w3.clearkey'
  };
  return handleSourceChange(
    {
      source: firstSource
    },
    {}
  ).then(() => {
    expect(shakaPlayer.load.mock.calls[0]).toEqual(['https://ok.com/puter', 33]);
    const drmConfig = shakaPlayer.configure.mock.calls[0][0];
    expect(drmConfig.drm.servers).toEqual({
      'org.w3.clearkey': 'https://example.com/license'
    });
  });
});
test(`Shaka helper handleSourceChange() configures DRM for the a FairPlay scheme where the source requires 
      JSON-wrapped base64 request format and needs to have the license url 
      parsed from the SKD value (as for example Edgio does).`, () => {
  const shakaPlayer = new MockShakaPlayer();
  const handleSourceChange = getSourceChangeHandler(shaka, shakaPlayer);
  const firstSource = {
    streamUrl: 'https://ok.com/puter',
    startPosition: 33,
    licenseUrl: 'https://example.com/license',
    drmType: 'com.apple.fps.1_0',
    mediaFormat: 'HLS',
    drmLicenseUri:{
      name: 'drmprovider.fairplay'
    },
    licenseAcquisitionDetails: {
      fairPlayCertificateUrl: "https://dummy.cer",
      extractLicenseUrlFromSkd: true,
      fairPlayRequestFormat: 'base64json'
    }
  };
  return handleSourceChange(
    {
      source: firstSource
    },
    {}
  ).then(() => {
    expect(shakaPlayer.load.mock.calls[0]).toEqual(['https://ok.com/puter', 33]);
    const drmConfig = shakaPlayer.configure.mock.calls[0][0];
    expect(drmConfig.drm.servers).toEqual({
      'com.apple.fps.1_0': 'https://example.com/license'
    });
    expect(drmConfig.drm.advanced).toEqual(expect.objectContaining({
      'com.apple.fps.1_0':{
        serverCertificateUri: firstSource.licenseAcquisitionDetails.fairPlayCertificateUrl
      }
    }));
  });
});
test(`Shaka helper handleSourceChange() registers request and response filters 
      if source specifies a license URL and requires the request to be in Base64-wrapped JSON format 
      and needs to have the license url parsed from the SKD value.`, () => {
  const shakaPlayer = new MockShakaPlayer();
  const handleSourceChange = getSourceChangeHandler(shaka, shakaPlayer);
  const firstSource = {
    streamUrl: 'https://ok.com/puter',
    startPosition: 33,
    licenseUrl: 'https://example.com/license',
    drmType: 'com.apple.fps.1_0',
    mediaFormat: 'HLS',
    drmLicenseUri:{
      name: 'drm'
    },
    licenseAcquisitionDetails: {
      fairPlayCertificateUrl: "https://dummy.cer",
      extractLicenseUrlFromSkd: true,
      fairPlayRequestFormat: 'base64json'
    }
  };
  return handleSourceChange(
    {
      source: firstSource
    },
    {}
  ).then(() => {
    expect(shakaPlayer.getNetworkingEngine().registerRequestFilter).toHaveBeenCalledTimes(1);
    expect(shakaPlayer.getNetworkingEngine().registerResponseFilter).toHaveBeenCalledTimes(1);
  });
});
