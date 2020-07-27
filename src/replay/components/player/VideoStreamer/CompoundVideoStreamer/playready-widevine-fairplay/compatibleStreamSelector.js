// @flow
import type { CompatibleStreamSelector } from '../CompoundVideoStreamer';
import { StreamResourceResolutionError } from '../CompoundVideoStreamer';
import {
  isLegacyMicrosoft,
  isChromiumEdgeOnWindows,
  isResourceFairPlay,
  isResourcePlayReady,
  isResourceWidevine,
  isResourcePlayReadyOrWidevine,
  isSafari
} from '../helpers';

const selectCompatibleDrmStream: CompatibleStreamSelector = (alternativeStreamResources, userAgent) => {
  const matcher = isSafari(userAgent)
    ? isResourceFairPlay
    : isLegacyMicrosoft(userAgent)
    ? isResourcePlayReady
    : isChromiumEdgeOnWindows(userAgent)
    ? isResourcePlayReadyOrWidevine
    : isResourceWidevine;
  const matchingStream = alternativeStreamResources.find(matcher);
  if (matchingStream) {
    return matchingStream;
  } else if (alternativeStreamResources.length) {
    if (isSafari(userAgent)) {
      const message =
        'The browser detected is Safari. Only HLS with FairPlay DRM is supported. ' +
        'Found no stream resource with contentType match for HLS and drmType match for FairPlay.';
      throw new StreamResourceResolutionError(message, 'FairPlay', alternativeStreamResources);
    } else if (isLegacyMicrosoft(userAgent)) {
      const message =
        'The browser detected is Microsoft Edge Legacy or Internet Explorer 11, supporting PlayReady DRM. ' +
        'Found no stream resource with drmType match for PlayReady.';
      throw new StreamResourceResolutionError(message, 'PlayReady', alternativeStreamResources);
    } else {
      const message =
        'The browser detected is assumed to support Widevine DRM (Chrome, Chromium-based Edge, Firefox and derivatives). ' +
        'Found no stream resource with drmType match for Widevine.';
      throw new StreamResourceResolutionError(message, 'Widevine', alternativeStreamResources);
    }
  } else {
    throw new StreamResourceResolutionError('No alternative stream resources were specified.');
  }
};

export default selectCompatibleDrmStream;
