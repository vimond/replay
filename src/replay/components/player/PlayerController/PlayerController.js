// @flow
import * as React from 'react';
import ControllerContext from './ControllerContext';
import type {
  AvailableTrack,
  InitialPlaybackProps,
  VideoStreamerMethods,
  PlaybackProps,
  VideoStreamerProps,
  VideoStreamState,
  VideoStreamStateKeys
} from '../VideoStreamer/types';
import type { ObserveCallback, ControllerApi, SetPropertiesMethod } from './ControllerContext';
import { override } from '../../common';
import memoize from 'memoize-one';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

export type RenderParameters = {
  controllerApi: ControllerApi,
  externalProps: any,
  configuration: any
};

export type RenderMethod = RenderParameters => React.Node;

export type PlaybackActions = {
  play: () => void,
  pause: () => void,
  setPosition: number => void,
  gotoLive: () => void,
  setVolume: number => void,
  setIsMuted: boolean => void,
  mute: () => void,
  unmute: () => void,
  requestPictureInPicture: () => void,
  exitPictureInPicture: () => void,
  showAirPlayTargetPicker: () => void,
  setSelectedAudioTrack: AvailableTrack => void,
  setSelectedTextTrack: (AvailableTrack | null) => void,
  capBitrate: number => void,
  fixBitrate: (number | 'max' | 'min') => void,
  inspect: () => VideoStreamState,
  setProperties: PlaybackProps => void
};

type PlayerControllerProps = {
  render: RenderMethod,
  children: React.Node,
  externalProps?: any,
  configuration?: any,
  options?: any,
  onPlaybackActionsReady?: PlaybackActions => void,
  onStreamStateChange?: VideoStreamState => void,
  onStreamerError?: any => void,
  initialPlaybackProps?: InitialPlaybackProps
};

type PlayerControllerState = {
  videoStreamerProps: VideoStreamerProps,
  setProperties: SetPropertiesMethod
};

const passPropsToVideoStreamer = (children: React.Node, props: any): React.Element<any> => {
  return React.Children.map(children, (child, i) => {
    if (i === 0) {
      return React.cloneElement(child, props);
    } else {
      return child;
    }
  })[0];
};

const getObserveManager = () => {
  const observers: { [VideoStreamStateKeys]: Array<ObserveCallback> } = {};

  const observe = (key: VideoStreamStateKeys, callback: ObserveCallback) => {
    if (!(key in observers)) {
      observers[key] = [];
    }
    observers[key].push(callback);
  };

  const unobserve = (key: VideoStreamStateKeys, callback: ObserveCallback) => {
    if (Array.isArray(observers[key])) {
      const index = observers[key].indexOf(callback);
      if (index !== -1) {
        observers[key].splice(index, 1);
      }
    }
  };

  const unobserveAll = () => {
    Object.entries(observers).forEach(([key, handlers]) => {
      while (handlers.length) {
        handlers.pop();
      }
    });
  };

  const update = (prop: VideoStreamState) => {
    Object.keys(prop).forEach(key => {
      if (Array.isArray(observers[key])) {
        observers[key].forEach(callback => {
          callback(prop);
        });
      }
    });
  };

  return {
    observe,
    unobserve,
    update,
    unobserveAll
  };
};

const createPlaybackActions = (inspect, setProperties: PlaybackProps => void): PlaybackActions => {
  const play = () => setProperties({ isPaused: false });
  const pause = () => setProperties({ isPaused: true });
  const setPosition = (position: number) => setProperties({ position });
  const gotoLive = () => setProperties({ isAtLiveEdge: true });
  const setVolume = (volume: number) => setProperties({ volume });
  const setIsMuted = (isMuted: boolean) => setProperties({ isMuted });
  const mute = () => setProperties({ isMuted: true });
  const unmute = () => setProperties({ isMuted: false });
  const requestPictureInPicture = () => setProperties({ isPipActive: true });
  const exitPictureInPicture = () => setProperties({ isPipActive: false });
  const showAirPlayTargetPicker = () => setProperties({ isAirPlayTargetPickerVisible: true });
  const setSelectedTextTrack = (selectedTextTrack: AvailableTrack | null) => setProperties({ selectedTextTrack });
  const setSelectedAudioTrack = (selectedAudioTrack: AvailableTrack) => setProperties({ selectedAudioTrack });
  const capBitrate = (bitrateCap: number) => setProperties({ bitrateCap });
  const fixBitrate = (bitrateFix: number | 'max' | 'min') => setProperties({ bitrateFix });
  return {
    play,
    pause,
    setPosition,
    gotoLive,
    setVolume,
    setIsMuted,
    mute,
    unmute,
    requestPictureInPicture,
    exitPictureInPicture,
    showAirPlayTargetPicker,
    setSelectedAudioTrack,
    setSelectedTextTrack,
    capBitrate,
    fixBitrate,
    setProperties,
    inspect
  };
};

class PlayerController extends React.Component<PlayerControllerProps, PlayerControllerState> {
  constructor(props: PlayerControllerProps) {
    super(props);
    const videoStreamerProps: VideoStreamerProps = {
      initialPlaybackProps: this.props.initialPlaybackProps, //TODO: This is overwritten by preferred settings. Reconsider.
      onReady: this.onVideoStreamerReady,
      onPlaybackError: this.props.onStreamerError,
      onStreamStateChange: this.onStreamStateChange
    };
    this.state = {
      videoStreamerProps,
      setProperties: () => {}
    };
  }

  componentDidMount() {
    const onReady = this.props.onPlaybackActionsReady;
    if (onReady) {
      onReady(
        createPlaybackActions(
          () => this.inspect(),
          props => this.setProperties(props)
        )
      );
    }
  }

  componentWillUnmount() {
    this.observeManager.unobserveAll();
  }

  inspectableStreamState: VideoStreamState = {};
  observeManager = getObserveManager();

  inspect = () => this.inspectableStreamState;

  mergeConfiguration = memoize(override);

  setProperties = (props: PlaybackProps) => this.state.setProperties(props);

  onVideoStreamerReady = ({ setProperties }: VideoStreamerMethods) => {
    this.inspectableStreamState = {};
    this.setState({ setProperties });
  };

  // Video streamer -> UI
  onStreamStateChange = (property: VideoStreamState) => {
    // if (!('position' in property) && !('bufferedAhead' in property)) { console.log('Updating %s', Object.keys(property).join(', '), property); }
    this.observeManager.update(property);
    this.inspectableStreamState = { ...this.inspectableStreamState, ...property };
    if (this.props.onStreamStateChange) {
      this.props.onStreamStateChange(property);
    }
  };

  render() {
    const { setProperties, videoStreamerProps } = this.state;
    const { observeManager } = this;
    const { render, externalProps, configuration, options } = this.props;
    const mergedConfiguration = this.mergeConfiguration(configuration, options);
    const { observe, unobserve } = observeManager;
    const controllerApi = {
      setProperties,
      videoStreamer: passPropsToVideoStreamer(this.props.children, {
        ...videoStreamerProps,
        configuration: mergedConfiguration.videoStreamer
      }),
      observe,
      inspect: this.inspect,
      unobserve
    };

    return (
      <ControllerContext.Provider value={controllerApi}>
        {render({ controllerApi, configuration: mergedConfiguration, externalProps })}
      </ControllerContext.Provider>
    );
  }
}

export default PlayerController;
