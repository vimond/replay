import type { AdvancedPlaybackSource, PlaybackSource } from '../types';

function normalizeSource(source: ?PlaybackSource): ?AdvancedPlaybackSource {
  return typeof source === 'string' ? { streamUrl: source } : source;
}

export default normalizeSource;
