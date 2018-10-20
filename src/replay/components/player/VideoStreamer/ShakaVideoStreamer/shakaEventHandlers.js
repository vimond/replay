// @flow
import type { PlaybackLifeCycle, StreamRangeHelper } from '../common/types';
import getBasicVideoEventHandlers from '../BasicVideoStreamer/basicVideoEventHandlers';
import type { ShakaPlayer } from './types';
import { PlaybackError } from '../types';
import type { InitialPlaybackProps, PlaybackProps, PlaybackSource, VideoStreamState } from '../types';
import type { BasicVideoEventHandlersProps } from '../BasicVideoStreamer/basicVideoEventHandlers';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

const mapShakaError = (err: any): PlaybackError => {
  // TODO
  return new PlaybackError('STREAM_ERROR', 'shaka');
};

const getShakaEventHandlers = <P: BasicVideoEventHandlersProps>({
  streamer,
  videoElement,
  thirdPartyPlayer,
  streamRangeHelper,
  configuration,
  applyProperties,
  updateStreamState,
  log
}: {
  streamer: {
    props: P
  },
  videoElement: HTMLVideoElement,
  thirdPartyPlayer: any,
  streamRangeHelper: StreamRangeHelper,
  configuration: ?{ pauseUpdateInterval?: ?number },
  applyProperties: PlaybackProps => void,
  updateStreamState: VideoStreamState => void,
  log?: string => void
}) => {
  const shakaPlayer: ShakaPlayer = thirdPartyPlayer;

  const htmlVideoHandlers = getBasicVideoEventHandlers({
    streamer,
    videoElement,
    thirdPartyPlayer,
    streamRangeHelper,
    configuration,
    applyProperties,
    updateStreamState
  });

  const { videoElementEventHandlers, pauseStreamRangeUpdater } = htmlVideoHandlers;

  let lifeCycleManager = {
    setStage: (_: PlaybackLifeCycle) => {},
    getStage: () => {}
  };

  const shakaEventHandlers = {
    error: ({ detail }: { detail: any }) => {
      log && log('shaka.error');
      const playbackError = mapShakaError(detail);
      if (streamer.props.onPlaybackError) {
        streamer.props.onPlaybackError(playbackError);
      }
      if (videoElement.error) {
        updateStreamState({ error: videoElement.error });
      }
      if (playbackError.severity === 'FATAL') {
        lifeCycleManager.setStage('dead');
        updateStreamState({ playState: 'inactive', isBuffering: false, isSeeking: false });
      }
      pauseStreamRangeUpdater.stop();
    },
    loading: () => {
      log && log('shaka.loading');
      if (lifeCycleManager.getStage() === 'new') {
        lifeCycleManager.setStage('starting');
        if (streamer.props.initialPlaybackProps) {
          const { isMuted, volume, lockedBitrate, maxBitrate } = streamer.props.initialPlaybackProps;
          // TODO: Perhaps apply on 'streaming' event in Shaka insted.
          applyProperties({ isMuted, volume, lockedBitrate, maxBitrate });
        }
        updateStreamState({
          playState: 'starting',
          isBuffering: true,
          volume: videoElement.volume,
          isMuted: videoElement.muted
        });
      }
    },
    streaming: () => {
      log && log('shaka.streaming');
      // TODO: Test! Or consider using autoplay: false.
      if (streamer.props.initialPlaybackProps && streamer.props.initialPlaybackProps.isPaused) {
        videoElement.pause();
      }
      updateStreamState(streamRangeHelper.calculateNewState());
    },
    buffering: ({ buffering }: { buffering: boolean }) => {
      log && log('shaka.error');
      updateStreamState({ isBuffering: buffering });
      if (buffering && lifeCycleManager.getStage() === 'started') {
        updateStreamState({ playState: 'buffering' });
      }
    }
  };

  function cleanup() {
    htmlVideoHandlers.cleanup();
    Object.entries(shakaEventHandlers).forEach(([name, handler]) => {
      shakaPlayer.removeEventListener(name, handler);
    });
  }

  function setLifeCycleManager(manager: { setStage: PlaybackLifeCycle => void, getStage: () => PlaybackLifeCycle }) {
    lifeCycleManager = manager;
    htmlVideoHandlers.setLifeCycleManager(manager);
  }

  Object.entries(shakaEventHandlers).forEach(([name, handler]) => {
    shakaPlayer.addEventListener(name, handler);
  });

  const {
    onCanPlay,
    onPlaying,
    onPause,
    onSeeking,
    onSeeked,
    onDurationChange,
    onTimeUpdate,
    onVolumeChange,
    onProgress,
    onEnded
  } = videoElementEventHandlers;
  return {
    videoElementEventHandlers: {
      onCanPlay,
      onPlaying,
      onPause,
      onSeeking,
      onSeeked,
      onDurationChange,
      onTimeUpdate,
      onVolumeChange,
      onProgress,
      onEnded
    },
    pauseStreamRangeUpdater,
    setLifeCycleManager,
    cleanup
  };
};

export default getShakaEventHandlers;
