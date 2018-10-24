// @flow
import type { PlaybackSource, VideoStreamerConfiguration } from '../types';
import Hls from 'hls.js';
import { PlaybackError } from '../types';

type Props<C: VideoStreamerConfiguration> = {
  source?: ?PlaybackSource,
  configuration?: ?C
};

function normalizeSource(source: ?(string | PlaybackSource)): ?PlaybackSource {
  return typeof source === 'string' ? { streamUrl: source } : source;
}

const getSourceChangeHandler = (hls: Hls) => <C: VideoStreamerConfiguration, P: Props<C>>(
  nextProps: P,
  prevProps?: P
): Promise<any> => {
  const source = normalizeSource(nextProps.source);
  if (source) {
    return new Promise((resolve, reject) => {
      try {
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          try {
            if (source.startPosition) {
              hls.startLoad(source.startPosition);
            } else {
              hls.startLoad();
            }
            resolve();
          } catch (e) {
            reject(new PlaybackError('STREAM_ERROR', 'hlsjs', 'Stream load start failed.', 'FATAL', e));
          }
        });
        hls.loadSource(source.streamUrl);
      } catch (e) {
        reject(new PlaybackError('STREAM_ERROR', 'hlsjs', 'Stream load failed.', 'FATAL', e));
      }
    });
  } else if (prevProps && prevProps.source) {
    // And no new source.
    return Promise.resolve(hls.stopLoad());
  } else {
    return Promise.resolve();
  }
};

export default getSourceChangeHandler;
