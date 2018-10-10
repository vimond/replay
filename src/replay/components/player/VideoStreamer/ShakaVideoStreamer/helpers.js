// @flow
import shaka from 'shaka-player';
import type { PlaybackSource } from '../types';
import type { ShakaRequestFilter, ShakaResponse, ShakaResponseFilter } from './types';

function normalizeSource(source: ?(string | PlaybackSource)): ?PlaybackSource {
  return typeof source === 'string' ? { streamUrl: source } : source;
}

function prepareDrm(source: PlaybackSource) {
  // TODO
  return Promise.resolve();
}

function notifyAvailabilityStartTime(manifestText) {
  const match = /availabilityStartTime="(.*?)"/.exec(manifestText);
  return match && match[1];
}

function prepareFilters(shakaPlayer: any, shakaRequestFilter: ?ShakaRequestFilter, shakaResponseFilter: ?ShakaResponseFilter, onStartTimeReady) {
  let shouldFindStartTime = true;
  
  function defaultResponseFilter(type: string, response: ShakaResponse) {
    switch (type) {
      case shaka.net.NetworkingEngine.RequestType.MANIFEST:
        if (shouldFindStartTime) {
          const manifestText = shaka.util.StringUtils.fromUTF8(response.data);
          const foundValue = notifyAvailabilityStartTime(manifestText);
          // TODO: Detect static manifest and give up.
          if (foundValue) {
            shouldFindStartTime = false;
            onStartTimeReady(new Date(foundValue));
          }
        }
        return;
    }
  }
  const networkingEngine = shakaPlayer.getNetworkingEngine();
  if (networkingEngine) {
    try {
      networkingEngine.clearAllRequestFilters();
      networkingEngine.clearAllResponseFilters();
      networkingEngine.registerResponseFilter(defaultResponseFilter);
      if (shakaRequestFilter) {
        networkingEngine.registerRequestFilter(shakaRequestFilter);
      }
      if (shakaResponseFilter) {
        networkingEngine.registerResponseFilter(shakaResponseFilter);
      }
    } catch (e) {
      // TODO: Logging?
    }
  }
  

  return Promise.resolve();
  // To be leaved for plugging in: Credentials, request headers, license request headers, manifest modification, manifest corrections.
}

export function handleSourceChange(
  shakaPlayer: any,
  nextSource: ?PlaybackSource,
  prevSource: ?PlaybackSource,
  shakaRequestFilter: ?ShakaRequestFilter,
  shakaResponseFilter: ?ShakaResponseFilter,
  onStartTimeReady: Date => void
) {
  const source = normalizeSource(nextSource);
  if (source) {
    return prepareFilters(shakaPlayer, shakaRequestFilter, shakaResponseFilter, onStartTimeReady)
      .then(() => prepareDrm(source))
      .then(() => shakaPlayer.load(source.streamUrl, source.startPosition));
  } else if (prevSource) { // And no new source.
    const networkingEngine = shakaPlayer.getNetworkingEngine();
    networkingEngine.clearAllRequestFilters();
    networkingEngine.clearAllResponseFilters();
    return shakaPlayer.unload();
  } else {
    return Promise.resolve();
  }
  // TODO: Add + remove filters.
}
