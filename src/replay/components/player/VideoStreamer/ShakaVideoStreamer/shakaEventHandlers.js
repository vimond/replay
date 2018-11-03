// @flow
import type { PlaybackLifeCycle, StreamRangeHelper } from '../common/types';
import getBasicVideoEventHandlers from '../BasicVideoStreamer/basicVideoEventHandlers';
import type { ShakaPlayer } from './types';
import type { PlaybackProps, VideoStreamState } from '../types';
import type { BasicVideoEventHandlersProps } from '../BasicVideoStreamer/basicVideoEventHandlers';
import mapShakaError from './shakaErrorMapper';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

const getShakaEventHandlers = <P: BasicVideoEventHandlersProps>({
  streamer,
  videoElement,
  shakaPlayer,
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
  shakaPlayer: ShakaPlayer,
  streamRangeHelper: StreamRangeHelper,
  configuration: ?{ pauseUpdateInterval?: ?number },
  applyProperties: PlaybackProps => void,
  updateStreamState: VideoStreamState => void,
  log?: string => void
}) => {
  const htmlVideoHandlers = getBasicVideoEventHandlers({
    streamer,
    videoElement,
    thirdPartyPlayer: shakaPlayer,
    streamRangeHelper,
    configuration,
    log,
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
      const playbackError = mapShakaError(
        lifeCycleManager.getStage() === 'started',
        detail,
        navigator.userAgent,
        document.location
      );
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
          const { isMuted, volume } = streamer.props.initialPlaybackProps;
          applyProperties({ isMuted, volume });
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
      if (streamer.props.initialPlaybackProps) {
        const { isPaused, bitrateFix, bitrateCap } = streamer.props.initialPlaybackProps;
        applyProperties({ bitrateFix, bitrateCap });
        if (isPaused) {
          videoElement.pause();
        }
        if (bitrateFix == null) {
          updateStreamState({ bitrateFix: null });
        }
        if (bitrateCap == null) {
          updateStreamState({ bitrateCap: null });
        }
      } else {
        updateStreamState({ bitrateFix: null, bitrateCap: null });
      }

      updateStreamState(streamRangeHelper.calculateNewState());
    },
    buffering: ({ buffering }: { buffering: boolean }) => {
      log && log('shaka.buffering.' + buffering.toString());
      if (buffering && lifeCycleManager.getStage() === 'started') {
        updateStreamState({ isBuffering: buffering, playState: 'buffering' });
      } else {
        updateStreamState({ isBuffering: buffering });
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
