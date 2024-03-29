// @flow
import type { AdvancedPlaybackSource, PlaybackSource, VideoStreamerConfiguration } from '../types';
import type { Shaka, ShakaPlayer, ShakaRequestFilter, ShakaResponseFilter } from './types';
import mapShakaError from './shakaErrorMapper';
import normalizeSource from '../common/sourceNormalizer';
import type { ShakaVideoStreamerConfiguration } from './injectableShakaVideoStreamer';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

const WIDEVINE_DRM_TYPE = 'com.widevine.alpha';
const PLAYREADY_DRM_TYPE = 'com.microsoft.playready';
const FAIRPLAY_DRM_TYPE = 'com.apple.fps.1_0';

type Props<C: VideoStreamerConfiguration> = {
  source?: ?PlaybackSource,
  shakaRequestFilter?: ?ShakaRequestFilter,
  shakaResponseFilter?: ?ShakaResponseFilter,
  configuration?: ?C
};

function getEmeAttributes(userAgent, serviceCertificate) {
  // For now, only deals with Chrome and Android Chrome distinctions.
  if (/Android(.*)Chrome/.test(userAgent)) {
    // Lowest level, SW_SECURE_CRYPTO, also for video.
    return {
      audioRobustness: 'SW_SECURE_CRYPTO',
      videoRobustness: 'SW_SECURE_CRYPTO',
      serviceCertificate: serviceCertificate,
      _classification: 'Android Chrome 58 and newer'
    };
  } else {
    return {
      audioRobustness: 'SW_SECURE_CRYPTO',
      videoRobustness: 'SW_SECURE_DECODE',
      serviceCertificate: serviceCertificate,
      _classification: 'Desktop'
    };
  }
}

function addLicenseRequestFilters(
  shakaLib: Shaka,
  shakaPlayer: ShakaPlayer,
  licenseRequestHeaders: { [string]: string }
) {
  shakaPlayer.getNetworkingEngine().registerRequestFilter((type: string, request) => {
    if (type === shakaLib.net.NetworkingEngine.RequestType.LICENSE) {
      Object.entries(licenseRequestHeaders).forEach(([key: string, value: string]) => {
        request.headers[key] = value;
      });
    }
  });
}

const addRequestFilterForHlsFairPlay =( shakaLib: Shaka, shakaPlayer: ShakaPlayer, details) => {
  shakaPlayer.getNetworkingEngine().registerRequestFilter((type: string, request) => {
    if (type !== shakaLib.net.NetworkingEngine.RequestType.LICENSE) {
      return;
    }
    if (details.extractLicenseUrlFromSkd === true) {
      const skdUri = shakaLib.util.StringUtils.fromBytesAutoDetect(request.initData);
      const licenseServerUri = skdUri.replace('skd://', 'https://');
      request.drmInfo.licenseServerUri = licenseServerUri;
      request.uris[0] = licenseServerUri;  
    }
    if (details.fairPlayRequestFormat === 'base64json') {
      const originalPayload = new Uint8Array(request.body);
      const base64Payload = shakaLib.util.Uint8ArrayUtils.toStandardBase64(originalPayload);
      request.headers['Content-Type'] = 'application/json';
      request.body = JSON.stringify({spc: base64Payload});
    }
  });
}
const addResponseFilterForHlsFairPlay =( shakaLib: Shaka, shakaPlayer: ShakaPlayer, details) => {
  if (details.fairPlayRequestFormat === 'base64json') {
    shakaPlayer.getNetworkingEngine().registerResponseFilter((type: string, response) => {
      if (type !== shakaLib.net.NetworkingEngine.RequestType.LICENSE) {
        return;
      }
      let utf8ResponseData = shakaLib.util.StringUtils.fromUTF8(response.data);
      utf8ResponseData = utf8ResponseData.trim();
      const jsonResponseData = JSON.parse(utf8ResponseData);
      response.data = shakaLib.util.Uint8ArrayUtils.fromBase64(jsonResponseData.ckc).buffer;
    });
  }  
}

function prepareDrm(
  shakaLib: Shaka,
  shakaPlayer: ShakaPlayer,
  source: AdvancedPlaybackSource,
  configuration: ?VideoStreamerConfiguration
) {
  const licenseUrl = source.licenseUrl;
  const drmType = source.drmType;
  const details = source.licenseAcquisitionDetails || {};
  const drmConfig = (configuration && configuration.licenseAcquisition) || {};
  const serviceCertificate =
    details.widevineServiceCertificateUrl || (drmConfig.widevine && drmConfig.widevine.serviceCertificateUrl);
  const fairPlayCertificateUrl = 
    details.fairPlayCertificateUrl || (drmConfig.fairPlay && drmConfig.fairPlay.serviceCertificateUrl);

  const widevineEmeAttributes = getEmeAttributes(navigator.userAgent, serviceCertificate);
  const { licenseRequestHeaders, robustness } = details;
  const widevineRobustness =
    robustness && robustness[WIDEVINE_DRM_TYPE]
      ? {
          audioRobustness: robustness[WIDEVINE_DRM_TYPE].audio,
          videoRobustness: robustness[WIDEVINE_DRM_TYPE].video
        }
      : drmConfig.widevine && drmConfig.widevine.robustness
      ? {
          audioRobustness: drmConfig.widevine.robustness.audio,
          videoRobustness: drmConfig.widevine.robustness.video
        }
      : {
          audioRobustness: widevineEmeAttributes.audioRobustness,
          videoRobustness: widevineEmeAttributes.videoRobustness
        };
  const playreadyRobustness =
    robustness && robustness[PLAYREADY_DRM_TYPE]
      ? {
          audioRobustness: robustness[PLAYREADY_DRM_TYPE].audio,
          videoRobustness: robustness[PLAYREADY_DRM_TYPE].video
        }
      : drmConfig.playReady && drmConfig.playReady.robustness
      ? {
          audioRobustness: drmConfig.playReady.robustness.audio,
          videoRobustness: drmConfig.playReady.robustness.video
        }
      : {
          videoRobustness: 'SW_SECURE_DECODE',
          audioRobustness: 'SW_SECURE_CRYPTO'
        };

  if (licenseRequestHeaders && Object.keys(licenseRequestHeaders).length > 0) {
    addLicenseRequestFilters(shakaLib, shakaPlayer, licenseRequestHeaders);
  }
  const servers = drmType
    ? { [drmType]: licenseUrl }
    : {
        [WIDEVINE_DRM_TYPE]: licenseUrl,
        [PLAYREADY_DRM_TYPE]: licenseUrl
      };
  if (drmType === FAIRPLAY_DRM_TYPE) {
    if(shakaLib.polyfill.PatchedMediaKeysApple){
      shakaLib.polyfill.PatchedMediaKeysApple.install();
    }
    addRequestFilterForHlsFairPlay(shakaLib, shakaPlayer, details);
    addResponseFilterForHlsFairPlay(shakaLib, shakaPlayer, details);
  }
  shakaPlayer.configure({
    drm: {
      servers,
      advanced: {
        [WIDEVINE_DRM_TYPE]: {
          ...widevineRobustness,
          serverCertificate: widevineEmeAttributes.serviceCertificate
        },
        [PLAYREADY_DRM_TYPE]: playreadyRobustness,
        [FAIRPLAY_DRM_TYPE]: {
          serverCertificateUri: fairPlayCertificateUrl,
        }
      }
    }
  });
  return Promise.resolve();
}

function prepareFilters(
  shakaPlayer: ShakaPlayer,
  shakaRequestFilter: ?ShakaRequestFilter,
  shakaResponseFilter: ?ShakaResponseFilter
) {
  const networkingEngine = shakaPlayer.getNetworkingEngine();
  if (networkingEngine) {
    networkingEngine.clearAllRequestFilters();
    networkingEngine.clearAllResponseFilters();
    if (shakaRequestFilter) {
      networkingEngine.registerRequestFilter(shakaRequestFilter);
    }
    if (shakaResponseFilter) {
      networkingEngine.registerResponseFilter(shakaResponseFilter);
    }
  }
  // To be leaved for plugging in: Credentials, request headers, license request headers, manifest modification, manifest corrections.
  return Promise.resolve();
}

const getSourceChangeHandler = (shakaLib: Shaka, shakaPlayer: ShakaPlayer) => <
  C: ShakaVideoStreamerConfiguration,
  P: Props<C>
>(
  nextProps: P,
  prevProps?: P
): Promise<any> => {
  const source = normalizeSource(nextProps.source);
  if (source) {
    const shakaConf = (nextProps.configuration && nextProps.configuration.shakaPlayer) || {};
    const { requestFilter = nextProps.shakaRequestFilter, responseFilter = nextProps.shakaResponseFilter } = shakaConf;
    return prepareFilters(shakaPlayer, requestFilter, responseFilter)
      .then(() => prepareDrm(shakaLib, shakaPlayer, source, nextProps.configuration))
      .then(() => shakaPlayer.load(source.streamUrl, source.startPosition))
      .catch(err => {
        if (err && err.code !== shakaLib.util.Error.Code?.LOAD_INTERRUPTED) {
          throw mapShakaError(shakaLib, false, err, navigator.userAgent, document.location);
        }
      });
  } else if (prevProps && prevProps.source) {
    // And no new source.
    const networkingEngine = shakaPlayer.getNetworkingEngine();
    networkingEngine.clearAllRequestFilters();
    networkingEngine.clearAllResponseFilters();
    return shakaPlayer.unload();
  } else {
    return Promise.resolve();
  }
};

export default getSourceChangeHandler;
