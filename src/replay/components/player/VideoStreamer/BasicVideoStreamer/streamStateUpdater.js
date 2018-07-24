// @flow
import getFilteredPropertyUpdater from './filteredPropertyUpdater';
import BasicVideoStreamer from './BasicVideoStreamer';
import type { PlaybackSource, VideoStreamState } from '../types';
import mapError from './errorMapper';

const saneNumberFilter = <T>(value) => (value == null || isNaN(value) ? 0 : value);

const filters = {
  position: saneNumberFilter,
  duration: saneNumberFilter
};

export type StreamStateUpdater = {
  eventHandlers: { [string]: () => void },
  notifyPropertyChange: VideoStreamState => void,
  startPlaybackSession: () => void 
};

function seekToInitialPosition(source: ?PlaybackSource, videoElement: HTMLVideoElement) {
  if (source && typeof source.startPosition === 'number') {
    videoElement.currentTime = source.startPosition;
  }
}

type PlaybackLifeCycle = 'new' | 'starting' | 'started' | 'ended' | 'dead' | 'unknown';

function getStreamStateUpdater(streamer: BasicVideoStreamer) {
  let lifeCycleStage: PlaybackLifeCycle = 'unknown';
  
  function withVideoElement(operation: HTMLVideoElement => void) {
    streamer.videoRef.current && operation(streamer.videoRef.current);
  }
  
  function invokeOnStreamStateChange(property: VideoStreamState) {
    if (streamer.props.onStreamStateChange) {
      try {
        streamer.props.onStreamStateChange(property);
      } catch(e) {
        console.error('onStreamStateChange failed.', e);
      }
    }
  }
  
  function notifyInitialState() {
    update({ duration: 0 });
    update({ position: 0 });
    update({ playMode: 'ondemand' });
    update({ playState: 'inactive' });
    update({ isBuffering: false });
    update({ isPaused: false });
    update({ isSeeking: false });
  }

  function startPlaybackSession() {
    lifeCycleStage = 'new';
    notifyInitialState();
    // TODO: Notify closedown of previous session?
  }
  
  function onError() {
    withVideoElement(videoElement => {
      const playbackError = mapError(videoElement);
      if (streamer.props.onPlaybackError) {
        // $FlowFixMe
        streamer.props.onPlaybackError(playbackError);
      }
      update({ error: videoElement.error });
      if (playbackError.severity === 'FATAL') {
        lifeCycleStage = 'dead';
        update({ playState: 'inactive' });
      }
    });
    lifeCycleStage = 'dead';
  }

  function onLoadStart() {
    if (lifeCycleStage === 'new') {
      lifeCycleStage = 'starting';
      update({ playState: 'starting', isBuffering: true });
    }
  }
  
  function onLoadedMetadata() {
    withVideoElement(videoElement => {
      seekToInitialPosition(streamer.props.source, videoElement);
      
      update({ position: videoElement.currentTime });
      update({ duration: videoElement.duration });
    });
  }
  
  function onCanPlay() {
    // If starting as paused, we consider "canplay" as completed starting. The playState must be updated accordingly.
    // When starting as playing, the starting to started transition is handled by the onPlaying handler.
    if (lifeCycleStage === 'starting') {
      if (streamer.props.isPaused) {
        lifeCycleStage = 'started';
      }
    }
    withVideoElement(videoElement => {
      if (videoElement.paused) {
        update({ playState: 'paused', isPaused: true, isBuffering: false, isSeeking: false });
      }
    });
  }
  
  function onWaiting() {
    if (lifeCycleStage === 'started') {
      update({ playState: 'buffering' });
    }
  }

  function onStalled() {
    // TODO: Fired after pausing in Safari.
    if (lifeCycleStage === 'started') {
      update({ playState: 'buffering' });
    }
  }
  
  function onPlaying() {
    // When this is invoked, and we are not starting as paused, we consider the playback as started.
    if (lifeCycleStage === 'starting') {
      lifeCycleStage = 'started';
    }
    if (lifeCycleStage === 'started') {
      update({ playState: 'playing', isBuffering: false, isPaused: false, isSeeking: false });
    }
  }
  
  function onPause() {
    if (lifeCycleStage === 'started') {
      update({ playState: 'paused', isPaused: true });
    }
  }
  
  function onSeeking() {
    if (lifeCycleStage === 'started') {
      update({ playState: 'seeking', isSeeking: true });
    }
  }

  function onSeeked() {
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
    withVideoElement(videoElement => {
      update({ position: videoElement.currentTime });
      update({ duration: videoElement.duration });
    });
  }
  
  function onTimeUpdate() {
    withVideoElement(videoElement => {
      update({ position: videoElement.currentTime });
    });
  }
  
  function onEnded() {
    if (lifeCycleStage === 'started') {
      lifeCycleStage = 'ended';
      update({ playState: 'inactive' });
    }
  }

  const { notifyPropertyChange } = getFilteredPropertyUpdater(invokeOnStreamStateChange, filters);
  const update = notifyPropertyChange;
  
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
      onError,
      onEnded
    },
    notifyPropertyChange: update,
    startPlaybackSession
  };
}

export default getStreamStateUpdater;