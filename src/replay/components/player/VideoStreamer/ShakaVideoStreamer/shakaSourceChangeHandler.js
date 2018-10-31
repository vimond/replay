// @flow
import type { PlaybackSource, VideoStreamerConfiguration } from '../types';
import type { ShakaPlayer, ShakaRequestFilter, ShakaResponseFilter } from './types';
import mapShakaError from './shakaErrorMapper';
import shaka from 'shaka-player';

type Props<C: VideoStreamerConfiguration> = {
  source?: ?PlaybackSource,
  shakaRequestFilter?: ?ShakaRequestFilter,
  shakaResponseFilter?: ?ShakaResponseFilter,
  configuration?: ?C
};

function normalizeSource(source: ?(string | PlaybackSource)): ?PlaybackSource {
  return typeof source === 'string' ? { streamUrl: source } : source;
}

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

function prepareDrm(shakaPlayer: ShakaPlayer, source: PlaybackSource, configuration: ?VideoStreamerConfiguration) {
  const licenseUrl = source.licenseUrl;
  const serviceCertificate =
    (source.licenseAcquisitionDetails && source.licenseAcquisitionDetails.widevineServiceCertificateUrl) ||
    (configuration &&
      configuration.licenseAcquisition &&
      configuration.licenseAcquisition.widevine &&
      configuration.licenseAcquisition.widevine.serviceCertificateUrl);
  const emeAttributes = getEmeAttributes(navigator.userAgent, serviceCertificate);
  shakaPlayer.configure({
    drm: {
      servers: {
        'com.widevine.alpha': licenseUrl,
        'com.microsoft.playready': licenseUrl
      },
      advanced: {
        'com.widevine.alpha': {
          audioRobustness: emeAttributes.audioRobustness,
          videoRobustness: emeAttributes.videoRobustness,
          serverCertificate: emeAttributes.serviceCertificate
        },
        'com.microsoft.playready': {
          videoRobustness: 'SW_SECURE_DECODE',
          audioRobustness: 'SW_SECURE_CRYPTO'
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

const getSourceChangeHandler = (shakaPlayer: ShakaPlayer) => <C: VideoStreamerConfiguration, P: Props<C>>(
  nextProps: P,
  prevProps?: P
): Promise<any> => {
  const { shakaRequestFilter, shakaResponseFilter } = nextProps;
  const source = normalizeSource(nextProps.source);
  if (source) {
    return prepareFilters(shakaPlayer, shakaRequestFilter, shakaResponseFilter)
      .then(() => prepareDrm(shakaPlayer, source, nextProps.configuration))
      .then(() => shakaPlayer.load(source.streamUrl, source.startPosition))
      .catch(err => {
        if (err && err.code !== shaka.util.Error.Code.LOAD_INTERRUPTED) {
          throw mapShakaError(false, err, navigator.userAgent, document.location);
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
