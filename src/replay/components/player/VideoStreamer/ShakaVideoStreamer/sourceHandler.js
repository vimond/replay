// @flow
import type { PlaybackSource } from '../types';
import type { ShakaPlayer, ShakaRequestFilter, ShakaResponseFilter } from './types';

type Props = {
  source?: ?PlaybackSource,
  shakaRequestFilter?: ?ShakaRequestFilter,
  shakaResponseFilter?: ?ShakaResponseFilter
};

function normalizeSource(source: ?(string | PlaybackSource)): ?PlaybackSource {
  return typeof source === 'string' ? { streamUrl: source } : source;
}

function prepareDrm(source: PlaybackSource) {
  // TODO
  return Promise.resolve();
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

const getSourceChangeHandler = (shakaPlayer: ShakaPlayer) => <T: Props>(
  nextProps: T,
  prevProps?: T
) : Promise<any> => {
  const { shakaRequestFilter, shakaResponseFilter } = nextProps;
  const source = normalizeSource(nextProps.source);
  if (source) {
    return prepareFilters(shakaPlayer, shakaRequestFilter, shakaResponseFilter)
      .then(() => prepareDrm(source))
      .then(() => shakaPlayer.load(source.streamUrl, source.startPosition));
  } else if (prevProps && prevProps.source) { // And no new source.
    const networkingEngine = shakaPlayer.getNetworkingEngine();
    networkingEngine.clearAllRequestFilters();
    networkingEngine.clearAllResponseFilters();
    return shakaPlayer.unload();
  } else {
    return Promise.resolve();
  }
}

export default getSourceChangeHandler;