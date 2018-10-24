// @flow
import type { PlaybackLifeCycle, StreamRangeHelper } from '../common/types';
import getBasicVideoEventHandlers from '../BasicVideoStreamer/basicVideoEventHandlers';
import Hls, { type HlsjsErrorData } from 'hls.js';
import type { PlaybackProps, VideoStreamState } from '../types';
import type { BasicVideoEventHandlersProps } from '../BasicVideoStreamer/basicVideoEventHandlers';
import { mapHlsjsError } from './hlsjsErrorMapper';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

const getHlsjsEventHandlers = <P: BasicVideoEventHandlersProps>({
  streamer,
  videoElement,
  hls,
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
  hls: Hls,
  streamRangeHelper: StreamRangeHelper,
  configuration: ?{ pauseUpdateInterval?: ?number },
  applyProperties: PlaybackProps => void,
  updateStreamState: VideoStreamState => void,
  log?: string => void
}) => {
  const htmlVideoHandlers = getBasicVideoEventHandlers({
    streamer,
    videoElement,
    thirdPartyPlayer: hls,
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

  function handleActualError(detail) {
    log && log('hlsjs.error');
    const playbackError = mapHlsjsError(lifeCycleManager.getStage() === 'started', detail);
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
  }

  function setLifeCycleManager(manager: { setStage: PlaybackLifeCycle => void, getStage: () => PlaybackLifeCycle }) {
    lifeCycleManager = manager;
    htmlVideoHandlers.setLifeCycleManager(manager);
  }

  const hlsjsEventHandlers = {
    [Hls.Events.ERROR]: (evt: any, data: HlsjsErrorData) => {
      switch (data.details) {
        case Hls.ErrorDetails.BUFFER_STALLED_ERROR:
          updateStreamState({ isBuffering: true });
          if (lifeCycleManager.getStage() === 'started') {
            updateStreamState({ playState: 'buffering' });
          }
          break;
        case Hls.ErrorDetails.BUFFER_SEEK_OVER_HOLE:
        case Hls.ErrorDetails.BUFFER_NUDGE_ON_STALL:
          break;
        case Hls.ErrorDetails.MANIFEST_PARSING_ERROR:
          if (data.url && !data.url.endsWith('undefined')) {
            handleActualError(data);
          }
          break;
        default:
          handleActualError(data);
      }
    },
    [Hls.Events.MANIFEST_LOADING]: () => {
      log && log('hlsjs.loading');
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
    [Hls.Events.FRAG_BUFFERED]: () => {
      updateStreamState({ isBuffering: false });
    },
    [Hls.Events.LEVEL_LOADED]: () => {
      // TODO - how to pass levelDuration and start date here? Can it be read from level?
      // updateStreamState(streamRangeHelper.calculateNewState());
    },
    [Hls.Events.MANIFEST_PARSED]: () => {
      log && log('hlsjs.parsed');
      if (streamer.props.initialPlaybackProps) {
        const { isPaused, lockedBitrate, maxBitrate } = streamer.props.initialPlaybackProps;
        applyProperties({ lockedBitrate, maxBitrate });
        if (isPaused) {
          videoElement.pause();
        }
      }
      updateStreamState(streamRangeHelper.calculateNewState());
    }
  };

  function cleanup() {
    Object.entries(hlsjsEventHandlers).forEach(([name, handler]) => {
      hls.off(name, handler);
    });
  }

  Object.entries(hlsjsEventHandlers).forEach(([name, handler]) => {
    hls.on(name, handler);
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
    onEnded,
    onError // We still want HTML video element error mapping.
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
      onEnded,
      onError
    },
    pauseStreamRangeUpdater,
    setLifeCycleManager,
    cleanup
  };
};

export default getHlsjsEventHandlers;
