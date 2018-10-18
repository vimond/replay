// @flow
import mapError from './errorMapper';
import type { PlaybackProps, PlaybackSource, VideoStreamerImplProps, VideoStreamState } from '../types';
import type { PlaybackLifeCycle } from '../common/streamStateUpdater-inject';
import type { SimplifiedVideoStreamer, StreamRangeHelper } from '../common/types';
import type { VideoStreamerConfiguration } from '../types';



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

export default function getBasicVideoEventHandlers<S: VideoStreamerConfiguration, T: VideoStreamerImplProps<S>>({
  streamer,
  videoElement,
  thirdPartyPlayer,
  streamRangeHelper,
  pauseStreamRangeUpdater,
  applyProperties,
  updateStreamState,
  getLifeCycle,
  setLifeCycle
}: {
  streamer: SimplifiedVideoStreamer<S, T>,
  videoElement: HTMLVideoElement,
  thirdPartyPlayer: any,
  streamRangeHelper: StreamRangeHelper,
  applyProperties: PlaybackProps => void,
  pauseStreamRangeUpdater: {
    start: () => void,
    stop: () => void
  },
  updateStreamState: VideoStreamState => void,
  getLifeCycle: () => PlaybackLifeCycle,
  setLifeCycle: PlaybackLifeCycle => void
}) {
  const isSafari =
    navigator.userAgent.indexOf('Safari') > 0 &&
    navigator.userAgent.indexOf('Chrome') < 0 &&
    navigator.userAgent.indexOf('Firefox') < 0;

  const isDebugging = window.location.search.indexOf('debug') > 0;
  if (isDebugging) {
    window.videoElementEvents = [];
  }
  const log = isDebugging
    ? (eventName: string) => window.videoElementEvents.push(eventName)
    : (eventName: string) => {};

  function onError() {
    const playbackError = mapError(videoElement);
    if (streamer.props.onPlaybackError) {
      streamer.props.onPlaybackError(playbackError);
    }
    updateStreamState({ error: videoElement.error });
    if (playbackError.severity === 'FATAL') {
      setLifeCycle('dead');
      updateStreamState({ playState: 'inactive', isBuffering: false, isSeeking: false });
    }
    pauseStreamRangeUpdater.stop();
  }

  // TODO: Use shaka 'loading' event.
  function onLoadStart() {
    log('loadstart');
    if (getLifeCycle() === 'new') {
      setLifeCycle('starting');
      if (streamer.props.initialPlaybackProps) {
        const { isMuted, volume, lockedBitrate, maxBitrate } = streamer.props.initialPlaybackProps;
        // TODO: Apply on 'streaming' event in Shaka insted.
        applyProperties(
          { isMuted, volume, lockedBitrate, maxBitrate }
        );
      }
      updateStreamState({ playState: 'starting', isBuffering: true, volume: videoElement.volume, isMuted: videoElement.muted });
    }
  }

  // TODO: Use shaka 'streaming' event. https://shaka-player-demo.appspot.com/docs/api/shaka.Player.html#.event:StreamingEvent
  function onLoadedMetadata() {
    log('loadedmetadata');

    // TODO: Test! Or consider using autoplay: false.
    if (streamer.props.initialPlaybackProps && streamer.props.initialPlaybackProps.isPaused) {
      videoElement.pause();
    }
    // TODO: This is handled by Shaka.
    seekToInitialPosition(streamer.props.source, videoElement);
    updateStreamState(streamRangeHelper.calculateNewState());

  }

  // TODO: Still useful?
  function onCanPlay() {
    log('canplay');
    // If starting as paused, we consider "canplay" as completed starting. The playState must be updated accordingly.
    // When starting as playing, the starting to started transition is handled by the onPlaying handler.
    if (getLifeCycle() === 'starting') {
      if (streamer.props.initialPlaybackProps && streamer.props.initialPlaybackProps.isPaused) {
        setLifeCycle('started');
      }
    }

    if (videoElement.paused) {
      updateStreamState({ playState: 'paused', isPaused: true, isBuffering: false, isSeeking: false });
      pauseStreamRangeUpdater.start();
    }
  }

  // TODO: Use Shaka buffering event.
  function onWaiting() {
    log('waiting');
    if (getLifeCycle() === 'started') {
      updateStreamState({ playState: 'buffering' });
    }
  }

  // TODO: Use Shaka buffering event.
  function onStalled() {
    log('stalled');
    // The stalled event is fired also after pausing in Safari.
    if (getLifeCycle() === 'started' && !isSafari) {
      updateStreamState({ playState: 'buffering' });
    }
  }

  function onPlaying() {
    log('playing');
    // When this is invoked, and we are not starting as paused, we consider the playback as started.
    if (getLifeCycle() === 'starting') {
      setLifeCycle('started');
    }
    if (getLifeCycle() === 'started') {
      updateStreamState({ playState: 'playing', isBuffering: false, isPaused: false, isSeeking: false });
    }
    pauseStreamRangeUpdater.stop();
  }

  function onPause() {
    log('pause');
    if (getLifeCycle() === 'started') {
      updateStreamState({ playState: 'paused', isPaused: true });
    }
    pauseStreamRangeUpdater.start();
  }

  function onSeeking() {
    log('seeking');
    pauseStreamRangeUpdater.stop();
    if (getLifeCycle() === 'started') {
      updateStreamState({ playState: 'seeking', isSeeking: true });
    }
  }

  function onSeeked() {
    log('seeked');
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
    log('durationchange');
    updateStreamState(streamRangeHelper.calculateNewState());
  }

  function onTimeUpdate() {
    updateStreamState(streamRangeHelper.calculateNewState());
  }

  function onVolumeChange() {
    log('volumechange');
    updateStreamState({ volume: videoElement.volume, isMuted: videoElement.muted });
  }

  // TODO: Test if it works as intended.
  function onProgress() {
    log('progress');
    updateStreamState({ bufferedAhead: calculateBufferedAhead(videoElement) });
  }

  function onEnded() {
    log('ended');
    if (getLifeCycle() === 'started') {
      setLifeCycle('ended');
      updateStreamState({ playState: 'inactive' });
    }
    pauseStreamRangeUpdater.stop();
  }

  function onPauseInterval() {
    streamRangeHelper.adjustForDvrStartOffset();
    updateStreamState(streamRangeHelper.calculateNewState());
  }

  function cleanup() {
    pauseStreamRangeUpdater.stop();
  }

  return {
    eventHandlers: {
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
    onPauseInterval,
    cleanup
  };
}
