// @flow
import shaka from 'shaka-player';
import createVideoStreamerWithShakaLibrary from './injectableShakaVideoStreamer';

const ShakaVideoStreamer = createVideoStreamerWithShakaLibrary(shaka);

export type { ShakaVideoStreamerConfiguration, ShakaVideoStreamerProps } from './injectableShakaVideoStreamer';
export default ShakaVideoStreamer;
