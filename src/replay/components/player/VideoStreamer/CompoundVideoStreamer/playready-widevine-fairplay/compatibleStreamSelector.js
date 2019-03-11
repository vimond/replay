// @flow
import type { CompatibleStreamSelector } from '../CompoundVideoStreamer';
import { StreamResourceResolutionError } from '../CompoundVideoStreamer';
import { isMicrosoft, isResourceFairPlay, isResourcePlayReady, isResourceWidevine, isSafari } from '../helpers';

const selectCompatibleDrmStream: CompatibleStreamSelector = (alternativeStreamResources, userAgent) => {
  const matcher = isSafari(userAgent)
    ? isResourceFairPlay
    : isMicrosoft(userAgent)
    ? isResourcePlayReady
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
    } else if (isMicrosoft(userAgent)) {
      const message =
        'The browser detected is Microsoft Edge or Internet Explorer 11, supporting PlayReady DRM. ' +
        'Found no stream resource with drmType match for PlayReady.';
      throw new StreamResourceResolutionError(message, 'PlayReady', alternativeStreamResources);
    } else {
      const message =
        'The browser detected is assumed to support Widevine DRM (Chrome, Firefox and derivatives). ' +
        'Found no stream resource with drmType match for Widevine.';
      throw new StreamResourceResolutionError(message, 'PlayReady', alternativeStreamResources);
    }
  } else {
    throw new StreamResourceResolutionError('No alternative stream resources were specified.');
  }
};

export default selectCompatibleDrmStream;
