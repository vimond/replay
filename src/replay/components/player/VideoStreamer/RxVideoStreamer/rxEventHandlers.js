// @flow
import type { BasicVideoEventHandlersProps } from '../BasicVideoStreamer/basicVideoEventHandlers';
import type { PlaybackLifeCycle, StreamRangeHelper } from '../common/types';
import type { PlaybackProps, VideoStreamState } from '../types';
import { PlaybackError } from '../types';
import getBasicVideoEventHandlers from '../BasicVideoStreamer/basicVideoEventHandlers';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

const mapError = (error: Error, severity: 'FATAL' | 'WARNING') =>
  new PlaybackError('STREAM_ERROR', 'rxplayer', 'Rx-player error: ' + error.message, severity, error);

const getRxEventHandlers = <P: BasicVideoEventHandlersProps>({
  streamer,
  rxPlayer,
  videoElement,
  streamRangeHelper,
  configuration,
  applyProperties,
  updateStreamState,
  log
}: {
  streamer: {
    props: P
  },
  rxPlayer: any,
  videoElement: HTMLVideoElement,
  streamRangeHelper: StreamRangeHelper,
  configuration: ?{ pauseUpdateInterval?: ?number },
  applyProperties: PlaybackProps => void,
  updateStreamState: VideoStreamState => void,
  log?: string => void
}) => {
  let lifeCycleManager = {
    setStage: (_: PlaybackLifeCycle) => {},
    getStage: () => {}
  };

  const htmlVideoHandlers = getBasicVideoEventHandlers({
    streamer,
    videoElement,
    thirdPartyPlayer: rxPlayer,
    streamRangeHelper,
    configuration,
    log,
    applyProperties,
    updateStreamState
  });

  const { videoElementEventHandlers, pauseStreamRangeUpdater } = htmlVideoHandlers;

  const rxEventHandlers = {
    playerStateChange: playerState => {
      log && log(playerState);
      switch (playerState) {
        case 'LOADING':
          lifeCycleManager.setStage('starting');

          updateStreamState({
            playState: 'starting',
            isBuffering: true,
            volume: videoElement.volume,
            isMuted: videoElement.muted
          });
          break;
        case 'LOADED':
          if (streamer.props.initialPlaybackProps) {
            const { isMuted, volume, bitrateFix, bitrateCap } = streamer.props.initialPlaybackProps;
            applyProperties({ isMuted, volume, bitrateFix, bitrateCap });
            if (volume != null) {
              onVolumeChange();
            }
          }
          lifeCycleManager.setStage('started');
          if (videoElement.paused) {
            updateStreamState({ playState: 'paused', isPaused: true, isBuffering: false, isSeeking: false });
            pauseStreamRangeUpdater.start();
          }
          updateStreamState(streamRangeHelper.calculateNewState());
          break;
        case 'PLAYING':
          updateStreamState({ playState: 'playing', isBuffering: false, isPaused: false, isSeeking: false });
          pauseStreamRangeUpdater.stop();
          break;
        case 'PAUSED':
          updateStreamState({ playState: 'paused', isPaused: true, isBuffering: false, isSeeking: false });
          pauseStreamRangeUpdater.start();
          break;
        case 'BUFFERING':
        case 'RELOADING':
          updateStreamState({ playState: 'buffering', isBuffering: true });
          break;
        case 'SEEKING':
          updateStreamState({ playState: 'seeking', isBuffering: true, isSeeking: true });
          break;
        case 'ENDED':
        case 'STOPPED':
          if (lifeCycleManager.getStage() === 'started') {
            lifeCycleManager.setStage('ended');
          }
          updateStreamState({ playState: 'inactive', isBuffering: false, isSeeking: false });
          pauseStreamRangeUpdater.stop();
          break;
        default:
          log && log('Unrecognised player state.');
      }
    },
    positionUpdate: () => {
      updateStreamState(streamRangeHelper.calculateNewState());
    },
    warning: (err: Error) => {
      const playbackError = mapError(err, 'WARNING');
      if (streamer.props.onPlaybackError) {
        streamer.props.onPlaybackError(playbackError);
      }
    },
    error: (err: Error) => {
      const playbackError = mapError(err, 'FATAL');
      if (streamer.props.onPlaybackError) {
        streamer.props.onPlaybackError(playbackError);
      }
      lifeCycleManager.setStage('dead');
      updateStreamState({ playState: 'inactive', isBuffering: false, isSeeking: false });
      pauseStreamRangeUpdater.stop();
    }
  };

  function setLifeCycleManager(manager: { setStage: PlaybackLifeCycle => void, getStage: () => PlaybackLifeCycle }) {
    lifeCycleManager = manager;
    htmlVideoHandlers.setLifeCycleManager(manager);
  }

  function cleanup() {
    htmlVideoHandlers.cleanup();
    Object.entries(rxEventHandlers).forEach(([name, handler]) => {
      rxPlayer.removeEventListener(name, handler);
    });
  }

  Object.entries(rxEventHandlers).forEach(([name, handler]) => {
    rxPlayer.addEventListener(name, handler);
  });

  const { onVolumeChange, onProgress } = videoElementEventHandlers;
  return {
    videoElementEventHandlers: {
      onVolumeChange,
      onProgress
    },
    pauseStreamRangeUpdater,
    setLifeCycleManager,
    cleanup
  };
};

export default getRxEventHandlers;
