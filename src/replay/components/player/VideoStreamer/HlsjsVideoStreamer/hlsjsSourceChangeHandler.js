// @flow
import type { PlaybackSource, VideoStreamerConfiguration } from '../types';
import Hls from 'hls.js';
import { PlaybackError } from '../types';
import { broadcastHlsInstance, hlsjsCleanup, hlsjsSetup } from './hlsjsSetup';
import type { HlsjsInstanceKeeper, HlsjsVideoStreamerConfiguration } from './HlsjsVideoStreamer';
import normalizeSource from '../common/sourceNormalizer';

type Props<C: VideoStreamerConfiguration> = {
  source?: ?PlaybackSource,
  configuration?: ?C
};

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
      // window.hls = hls;
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
