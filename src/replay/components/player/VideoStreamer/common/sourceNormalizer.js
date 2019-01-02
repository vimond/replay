// @flow
import type { AdvancedPlaybackSource, PlaybackSource } from '../types';

const normalizeSource = (source: ?PlaybackSource): ?AdvancedPlaybackSource =>
  typeof source === 'string' ? { streamUrl: source } : source;

export default normalizeSource;
