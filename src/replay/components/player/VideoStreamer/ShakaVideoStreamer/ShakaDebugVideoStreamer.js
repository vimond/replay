// @flow
import shaka from 'shaka-player/dist/shaka-player.compiled.debug';
import createVideoStreamerWithShakaLibrary from './injectableShakaVideoStreamer';

const ShakaDebugVideoStreamer = createVideoStreamerWithShakaLibrary(shaka);

window.shaka = shaka;

export type { ShakaVideoStreamerConfiguration, ShakaVideoStreamerProps } from './injectableShakaVideoStreamer';
export default ShakaDebugVideoStreamer;
