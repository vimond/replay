// @flow
import type { PlaybackSource, VideoStreamerConfiguration } from '../types';
import Hls from 'hls.js';
import { PlaybackError } from '../types';
import { broadcastHlsInstance, hlsjsCleanup, hlsjsSetup } from './hlsjsSetup';
import type { HlsjsInstanceKeeper, HlsjsVideoStreamerConfiguration } from './HlsjsVideoStreamer';

type Props<C: VideoStreamerConfiguration> = {
  source?: ?PlaybackSource,
  configuration?: ?C
};

function normalizeSource(source: ?(string | PlaybackSource)): ?PlaybackSource {
  return typeof source === 'string' ? { streamUrl: source } : source;
}

const getSourceChangeHandler = (instanceKeeper: HlsjsInstanceKeeper) => <
  C: HlsjsVideoStreamerConfiguration,
  P: Props<C>
>(
  nextProps: P,
  prevProps?: P
): Promise<any> => {
  const { videoElement } = instanceKeeper;
  hlsjsCleanup(instanceKeeper);
  const source = normalizeSource(nextProps.source);
  if (source) {
    return hlsjsSetup(videoElement, nextProps.configuration).then(hls => {
      instanceKeeper.hls = hls;
      broadcastHlsInstance(instanceKeeper, 'on');
      return new Promise((resolve, reject) => {
        const onMediaLoaded = () => {
          hls.off(Hls.Events.MANIFEST_PARSED, onMediaLoaded);
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
        };
        try {
          hls.stopLoad();
          hls.on(Hls.Events.MANIFEST_PARSED, onMediaLoaded);
          hls.loadSource(source.streamUrl);
        } catch (e) {
          reject(new PlaybackError('STREAM_ERROR', 'hlsjs', 'Stream load failed.', 'FATAL', e));
        }
      });
    });
  } /* else if (prevProps && prevProps.source) {
    // And no new source.
    return Promise.resolve(instanceKeeper.hls && instanceKeeper.hls.stopLoad());
  }*/ else {
    return Promise.resolve();
  }
};

export default getSourceChangeHandler;
