// @flow
import * as React from 'react';
import ControllerContext from './ControllerContext';
import type {
  PlaybackMethods,
  PlaybackProps,
  VideoStreamerProps,
  VideoStreamState,
  VideoStreamStateKeys
} from '../VideoStreamer/types';
import type { ObserveCallback, GotoLiveMethod, SetPositionMethod, ControllerApi } from './ControllerContext';
import { override } from '../../common';
import memoize from 'memoize-one';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

export type RenderData = {
  controllerApi: ControllerApi,
  externalProps: any,
  configuration: any
};

export type RenderMethod = RenderData => React.Node;

type PlayerControllerProps = {
  render: RenderMethod,
  children: React.Node,
  externalProps?: any,
  configuration?: any,
  options?: any,
  onStreamerError?: any => void,
  startMuted?: boolean,
  startPaused?: boolean,
  startVolume?: number,
  maxBitrate?: number,
  lockedBitrate?: number | string
};

type PlayerControllerState = {
  gotoLive: GotoLiveMethod,
  setPosition: SetPositionMethod,
  videoStreamerProps: VideoStreamerProps
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

class PlayerController extends React.Component<PlayerControllerProps, PlayerControllerState> {
  constructor(props: PlayerControllerProps) {
    super(props);
    const videoStreamerProps: VideoStreamerProps = {
      onReady: this.onVideoStreamerReady,
      onPlaybackError: this.props.onStreamerError,
      onStreamStateChange: this.onStreamStateChange
    };
    if (props.startMuted != null) {
      videoStreamerProps.isMuted = props.startMuted;
    }
    if (props.startPaused != null) {
      videoStreamerProps.isPaused = props.startPaused;
    }
    if (props.startVolume != null) {
      videoStreamerProps.volume = props.startVolume;
    }
    if (props.lockedBitrate != null) {
      videoStreamerProps.lockedBitrate = props.lockedBitrate;
    } else if (props.maxBitrate != null) {
      videoStreamerProps.maxBitrate = props.maxBitrate;
    }
    this.state = {
      gotoLive: () => {},
      setPosition: () => {},
      videoStreamerProps
    };
  }

  inspectableStreamState: VideoStreamState = {};

  inspect = () => this.inspectableStreamState;

  mergeConfiguration = memoize(override);

  componentWillUnmount() {
    this.observeManager.unobserveAll();
  }

  observeManager = getObserveManager();

  onVideoStreamerReady = (methods: PlaybackMethods) => {
    this.inspectableStreamState = {};
    this.setState({
      gotoLive: methods.gotoLive,
      setPosition: methods.setPosition
    });
  };

  // Video stream -> UI
  onStreamStateChange = (property: VideoStreamState) => {
    this.observeManager.update(property);
    this.inspectableStreamState = { ...this.inspectableStreamState, ...property };
  };

  // UI -> video stream
  updateProperty = (updatedProp: PlaybackProps) => {
    const videoStreamerProps = { ...this.state.videoStreamerProps, ...updatedProp };
    this.setState({ videoStreamerProps });
  };

  render() {
    const { gotoLive, setPosition, videoStreamerProps } = this.state;
    const { updateProperty, observeManager } = this;
    const { render, externalProps, configuration, options } = this.props;
    const mergedConfiguration = this.mergeConfiguration(configuration, options);
    const { observe, unobserve } = observeManager;
    const controllerApi = {
      updateProperty,
      gotoLive,
      setPosition,
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
