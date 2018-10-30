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
import type { ObserveCallback, ControllerApi, SetPropertyMethod } from './ControllerContext';
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
  setSelectedAudioTrack: AvailableTrack => void,
  setSelectedTextTrack: AvailableTrack => void,
  capBitrate: number => void,
  fixBitrate: (number | 'max' | 'min') => void,
  inspect: () => VideoStreamState,
  setProperty: PlaybackProps => void
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
  setProperty: SetPropertyMethod
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

const createPlaybackActions = (inspect, setProperty: PlaybackProps => void): PlaybackActions => {
  const play = () => setProperty({ isPaused: false });
  const pause = () => setProperty({ isPaused: true });
  const setPosition = (position: number) => setProperty({ position });
  const gotoLive = () => setProperty({ isAtLivePosition: true });
  const setVolume = (volume: number) => setProperty({ volume });
  const setIsMuted = (isMuted: boolean) => setProperty({ isMuted });
  const setSelectedTextTrack = (selectedTextTrack: AvailableTrack) => setProperty({ selectedTextTrack });
  const setSelectedAudioTrack = (selectedAudioTrack: AvailableTrack) => setProperty({ selectedAudioTrack });
  const capBitrate = (maxBitrate: number) => setProperty({ maxBitrate });
  const fixBitrate = (bitrateFix: number | 'max' | 'min') => setProperty({ bitrateFix });
  return {
    play,
    pause,
    setPosition,
    gotoLive,
    setVolume,
    setIsMuted,
    setSelectedAudioTrack,
    setSelectedTextTrack,
    capBitrate,
    fixBitrate,
    setProperty,
    inspect
  };
};

class PlayerController extends React.Component<PlayerControllerProps, PlayerControllerState> {
  constructor(props: PlayerControllerProps) {
    super(props);
    const videoStreamerProps: VideoStreamerProps = {
      initialPlaybackProps: this.props.initialPlaybackProps,
      onReady: this.onVideoStreamerReady,
      onPlaybackError: this.props.onStreamerError,
      onStreamStateChange: this.onStreamStateChange
    };
    this.state = {
      videoStreamerProps,
      setProperty: () => {}
    };
  }

  componentDidMount() {
    const onReady = this.props.onPlaybackActionsReady;
    if (onReady) {
      onReady(createPlaybackActions(() => this.inspect(), props => this.setProperty(props)));
    }
  }

  componentWillUnmount() {
    this.observeManager.unobserveAll();
  }

  inspectableStreamState: VideoStreamState = {};
  observeManager = getObserveManager();

  inspect = () => this.inspectableStreamState;

  mergeConfiguration = memoize(override);

  setProperty = (props: PlaybackProps) => this.state.setProperty(props);

  onVideoStreamerReady = ({ setProperty }: VideoStreamerMethods) => {
    this.inspectableStreamState = {};
    this.setState({ setProperty });
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
    const { setProperty, videoStreamerProps } = this.state;
    const { observeManager } = this;
    const { render, externalProps, configuration, options } = this.props;
    const mergedConfiguration = this.mergeConfiguration(configuration, options);
    const { observe, unobserve } = observeManager;
    const controllerApi = {
      setProperty,
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
