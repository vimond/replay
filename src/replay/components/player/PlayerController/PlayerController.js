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
// $FlowFixMe // Flow has problems with the typed version of this lib.
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
  onStreamerError?: any => void
};

type PlayerControllerState = {
  gotoLive: GotoLiveMethod,
  setPosition: SetPositionMethod,
  videoStreamerProps: VideoStreamerProps
};

const passPropsToVideoStreamer = (children: React.Node, props: any) => {
  return React.Children.map(children, (child, i) => {
    if (i === 0) {
      return React.cloneElement(child, props);
    } else {
      return child;
    }
  });
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
    this.state = {
      gotoLive: () => {},
      setPosition: () => {},
      videoStreamerProps: {
        onReady: this.onVideoStreamerReady,
        onError: this.props.onStreamerError,
        onStreamStateChange: this.onStreamStateChange
      }
    };
  }

  inspectableStreamState: VideoStreamState = {};

  isUnmounting = false; // TODO: Eliminate this.

  inspect = () => this.inspectableStreamState;

  mergeConfiguration = memoize(override);
  
  componentDidMount() {
    this.isUnmounting = false;
  }
  
  componentWillUnmount() {
    this.observeManager.unobserveAll();
    this.isUnmounting = true;
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
    if (!this.isUnmounting) {
      this.observeManager.update(property);
      this.inspectableStreamState = { ...this.inspectableStreamState, ...property };
    }
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
      videoStreamer: passPropsToVideoStreamer(this.props.children, { ...videoStreamerProps, configuration: mergedConfiguration.videoStreamer }),
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
