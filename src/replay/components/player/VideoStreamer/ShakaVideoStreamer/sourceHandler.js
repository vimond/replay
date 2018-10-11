// @flow
import shaka from 'shaka-player';
import type { PlaybackSource } from '../types';
import type { ShakaPlayer, ShakaRequestFilter, ShakaResponse, ShakaResponseFilter } from './types';

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

function prepareFilters(
  shakaPlayer: ShakaPlayer,
  shakaRequestFilter: ?ShakaRequestFilter,
  shakaResponseFilter: ?ShakaResponseFilter
) {
  const networkingEngine = shakaPlayer.getNetworkingEngine();
  if (networkingEngine) {
    try {
      networkingEngine.clearAllRequestFilters();
      networkingEngine.clearAllResponseFilters();
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
  // To be leaved for plugging in: Credentials, request headers, license request headers, manifest modification, manifest corrections.
  return Promise.resolve();
}

export function handleSourceChange(
  shakaPlayer: ShakaPlayer,
  nextSource: ?PlaybackSource,
  prevSource: ?PlaybackSource,
  shakaRequestFilter: ?ShakaRequestFilter,
  shakaResponseFilter: ?ShakaResponseFilter
) {
  const source = normalizeSource(nextSource);
  if (source) {
    return prepareFilters(shakaPlayer, shakaRequestFilter, shakaResponseFilter)
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
}
