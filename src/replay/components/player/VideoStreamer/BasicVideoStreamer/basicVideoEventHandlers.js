// @flow
import mapError from './errorMapper';
import type { InitialPlaybackProps, PlaybackProps, PlaybackSource, VideoStreamState } from '../types';
import type { PlaybackLifeCycle, StreamRangeHelper } from '../common/types';
import { PlaybackError } from '../types';
import { getIntervalRunner } from '../../../common';

const defaultPauseUpdateInterval = 5;

function seekToInitialPosition(source: ?PlaybackSource, videoElement: HTMLVideoElement) {
  if (source && typeof source.startPosition === 'number') {
    videoElement.currentTime = source.startPosition;
  }
}

function calculateBufferedAhead(videoElement: HTMLVideoElement): number {
  const currentTime = videoElement.currentTime;
  const buffered = videoElement.buffered;
  let ahead = 0;

  for (let i = 0; i < buffered.length; ++i) {
    if (buffered.start(i) <= currentTime && buffered.end(i) >= currentTime) {
      ahead = buffered.end(i) - currentTime;
      break;
    }
  }
  return ahead;
}

// export default function getBasicVideoEventHandlers<C: VideoStreamerConfiguration, P: VideoStreamerImplProps<C>>

export type BasicVideoEventHandlersProps = {
  onPlaybackError?: PlaybackError => void,
  initialPlaybackProps?: InitialPlaybackProps,
  source?: ?PlaybackSource
};

const getBasicVideoEventHandlers = <P: BasicVideoEventHandlersProps>({
  streamer,
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
  videoElement: HTMLVideoElement,
  streamRangeHelper: StreamRangeHelper,
  configuration: ?{ pauseUpdateInterval?: ?number },
  applyProperties: PlaybackProps => void,
  updateStreamState: VideoStreamState => void,
  log?: string => void
}) => {
  const isSafari =
    navigator.userAgent.indexOf('Safari') > 0 &&
    navigator.userAgent.indexOf('Chrome') < 0 &&
    navigator.userAgent.indexOf('Firefox') < 0;

  const isDebugging = window.location.search.indexOf('debug') > 0;
  if (isDebugging) {
    window.videoElementEvents = [];
  }

  let lifeCycleManager = {
    setStage: (_: PlaybackLifeCycle) => {},
    getStage: () => {}
  };

  function onError() {
    const playbackError = mapError(videoElement);
    if (streamer.props.onPlaybackError) {
      streamer.props.onPlaybackError(playbackError);
    }
    updateStreamState({ error: videoElement.error });
    if (playbackError.severity === 'FATAL') {
      lifeCycleManager.setStage('dead');
      updateStreamState({ playState: 'inactive', isBuffering: false, isSeeking: false });
    }
    pauseStreamRangeUpdater.stop();
  }

  function onLoadStart() {
    log && log('loadstart');
    if (lifeCycleManager.getStage() === 'new') {
      lifeCycleManager.setStage('starting');
      if (streamer.props.initialPlaybackProps) {
        const { isMuted, volume, bitrateFix, bitrateCap } = streamer.props.initialPlaybackProps;
        applyProperties({ isMuted, volume, bitrateFix: bitrateFix, bitrateCap: bitrateCap });
      }
      updateStreamState({
        playState: 'starting',
        isBuffering: true,
        volume: videoElement.volume,
        isMuted: videoElement.muted
      });
    }
  }

  function onLoadedMetadata() {
    log && log('loadedmetadata');
    if (streamer.props.initialPlaybackProps && streamer.props.initialPlaybackProps.isPaused) {
      videoElement.pause();
    }
    seekToInitialPosition(streamer.props.source, videoElement);
    updateStreamState(streamRangeHelper.calculateNewState());
  }

  function onCanPlay() {
    log && log('canplay');
    // If starting as paused, we consider "canplay" as completed starting. The playState must be updated accordingly.
    // When starting as playing, the starting to started transition is handled by the onPlaying handler.
    const stage = lifeCycleManager.getStage();
    if (stage === 'starting') {
      if (streamer.props.initialPlaybackProps && streamer.props.initialPlaybackProps.isPaused) {
        lifeCycleManager.setStage('started');
      }
    } else if (stage === 'started') {
      updateStreamState({ isBuffering: false, playState: videoElement.paused ? 'paused' : 'playing' });
    }

    if (videoElement.paused) {
      updateStreamState({ playState: 'paused', isPaused: true, isBuffering: false, isSeeking: false });
      pauseStreamRangeUpdater.start();
    }
  }

  function onWaiting() {
    log && log('waiting');
    updateStreamState({ isBuffering: true });
    if (lifeCycleManager.getStage() === 'started') {
      updateStreamState({ playState: 'buffering' });
    }
  }

  function onStalled() {
    log && log('stalled');
    // The stalled event is fired also after pausing in Safari.
    if (!isSafari) {
      updateStreamState({ isBuffering: true });
      if (lifeCycleManager.getStage() === 'started') {
        updateStreamState({ playState: 'buffering' });
      }
    }
  }

  function onPlaying() {
    log && log('playing');
    // When this is invoked, and we are not starting as paused, we consider the playback as started.
    if (lifeCycleManager.getStage() === 'starting') {
      lifeCycleManager.setStage('started');
    }
    if (lifeCycleManager.getStage() === 'started') {
      updateStreamState({ playState: 'playing', isBuffering: false, isPaused: false, isSeeking: false });
    }
    pauseStreamRangeUpdater.stop();
  }

  function onPause() {
    log && log('pause');
    if (lifeCycleManager.getStage() === 'started') {
      updateStreamState({ playState: 'paused', isPaused: true });
    }
    pauseStreamRangeUpdater.start();
  }

  function onSeeking() {
    log && log('seeking');
    pauseStreamRangeUpdater.stop();
    if (lifeCycleManager.getStage() === 'started') {
      updateStreamState({ playState: 'seeking', isSeeking: true });
    }
  }

  function onSeeked() {
    log && log('seeked');
    if (isSafari) {
      if (videoElement.paused) {
        updateStreamState({ playState: 'paused', isPaused: true, isBuffering: false, isSeeking: false });
        pauseStreamRangeUpdater.start();
      } else {
        updateStreamState({ playState: 'playing', isPaused: false, isBuffering: false, isSeeking: false });
        pauseStreamRangeUpdater.stop();
      }
    }
    /*if (lifeCycleStage === 'started') {
      withVideoElement(videoElement => {
        // TODO: The video element is always paused from before seek start to after seek end. Might need a workaround.
        if (videoElement.paused) {
          update({ playState: 'paused', isPaused: true });
        } else {
          update({ playState: 'playing', isPaused: false });
        }
      });
    }*/
  }

  function onDurationChange() {
    log && log('durationchange');
    updateStreamState(streamRangeHelper.calculateNewState());
  }

  function onTimeUpdate() {
    updateStreamState(streamRangeHelper.calculateNewState());
  }

  function onVolumeChange() {
    log && log('volumechange');
    updateStreamState({ volume: videoElement.volume, isMuted: videoElement.muted });
  }

  function onProgress() {
    updateStreamState({ bufferedAhead: calculateBufferedAhead(videoElement) });
  }

  function onEnded() {
    log && log('ended');
    if (lifeCycleManager.getStage() === 'started') {
      lifeCycleManager.setStage('ended');
      updateStreamState({ playState: 'inactive' });
    }
    pauseStreamRangeUpdater.stop();
  }

  function onPauseInterval() {
    streamRangeHelper.adjustForDvrStartOffset();
    updateStreamState(streamRangeHelper.calculateNewState());
  }

  function setLifeCycleManager(manager: { setStage: PlaybackLifeCycle => void, getStage: () => PlaybackLifeCycle }) {
    lifeCycleManager = manager;
  }

  const pauseStreamRangeUpdater = getIntervalRunner(
    onPauseInterval,
    (configuration && configuration.pauseUpdateInterval) || defaultPauseUpdateInterval
  );

  function cleanup() {}

  return {
    videoElementEventHandlers: {
      onLoadStart,
      onLoadedMetadata,
      onCanPlay,
      onWaiting,
      onStalled,
      onPlaying,
      onPause,
      onSeeking,
      onSeeked,
      onDurationChange,
      onTimeUpdate,
      onVolumeChange,
      onProgress,
      onError,
      onEnded
    },
    pauseStreamRangeUpdater,
    setLifeCycleManager,
    cleanup
  };
};

export default getBasicVideoEventHandlers;
