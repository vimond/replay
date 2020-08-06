// @flow
import type { AdvancedPlaybackSource, PlaybackSource, VideoStreamerConfiguration } from '../types';
import type { Shaka, ShakaPlayer, ShakaRequestFilter, ShakaResponseFilter } from './types';
import mapShakaError from './shakaErrorMapper';
import normalizeSource from '../common/sourceNormalizer';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

const widevine = 'com.widevine.alpha';
const playready = 'com.microsoft.playready';

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

function addLicenseRequestFilters(shakaLib: Shaka, shakaPlayer: ShakaPlayer, licenseRequestHeaders: { [string]: string }) {
  shakaPlayer.getNetworkingEngine().registerRequestFilter((type: string, request) => {
    if (type === shakaLib.net.NetworkingEngine.RequestType.LICENSE) {
      Object.entries(licenseRequestHeaders).forEach(([key: string, value: string]) => {
        request.headers[key] = value;
      });
    }
  });
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

  const widevineEmeAttributes = getEmeAttributes(navigator.userAgent, serviceCertificate);
  const { licenseRequestHeaders, robustness } = details;
  const widevineRobustness =
    robustness && robustness[widevine]
      ? {
          audioRobustness: robustness[widevine].audio,
          videoRobustness: robustness[widevine].video
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
    robustness && robustness[playready]
      ? {
          audioRobustness: robustness[playready].audio,
          videoRobustness: robustness[playready].video
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
        [widevine]: licenseUrl,
        [playready]: licenseUrl
      };

  shakaPlayer.configure({
    drm: {
      servers,
      advanced: {
        'com.widevine.alpha': {
          ...widevineRobustness,
          serverCertificate: widevineEmeAttributes.serviceCertificate
        },
        'com.microsoft.playready': playreadyRobustness
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

const getSourceChangeHandler = (shakaLib: Shaka, shakaPlayer: ShakaPlayer) => <C: VideoStreamerConfiguration, P: Props<C>>(
  nextProps: P,
  prevProps?: P
): Promise<any> => {
  const { shakaRequestFilter, shakaResponseFilter } = nextProps;
  const source = normalizeSource(nextProps.source);
  if (source) {
    return prepareFilters(shakaPlayer, shakaRequestFilter, shakaResponseFilter)
      .then(() => prepareDrm(shakaLib, shakaPlayer, source, nextProps.configuration))
      .then(() => shakaPlayer.load(source.streamUrl, source.startPosition))
      .catch(err => {
        if (err && err.code !== shakaLib.util.Error.Code.LOAD_INTERRUPTED) {
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
