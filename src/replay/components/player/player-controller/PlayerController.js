// @flow
import * as React from 'react';
import ControllerContext from './ControllerContext';
import type { PlaybackMethods, PlaybackProps, VideoStreamerProps, VideoStreamState, VideoStreamStateKeys } from '../VideoStreamer/types';
import type { ObserveCallback, GotoLiveMethod, SetPositionMethod, ControllerApi } from './ControllerContext';
import { override } from '../../common';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

export type RenderData = {
  controllerApi: ControllerApi,
  configuration: any
};

export type RenderMethod = RenderData => React.Node;

type PlayerControllerProps = {
  render: RenderMethod,
  children: React.Node,
  configuration: any,
  options?: any,
  onStreamerError?: any => void
};

type PlayerControllerState = {
  gotoLive: GotoLiveMethod,
  setPosition: SetPositionMethod,
  mergedConfiguration: any,
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
    //TODO: What if this.setState is identical across elements?
    if (Array.isArray(observers[key])) {
      const index = observers[key].indexOf(callback);
      if (index !== -1) {
        observers[key].splice(index, 1);
      }
    }
  };

  const unobserveAll = () => {
    Object.entries(observers).forEach(([key, handlers]) => {
      while (handlers) {
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
    const mergedConfiguration = override(props.configuration, props.options) || {};
    this.state = {
      gotoLive: () => {},
      setPosition: () => {},
      mergedConfiguration,
      videoStreamerProps: {
        onReady: this.onVideoStreamerReady,
        onError: this.props.onStreamerError,
        onStreamStateChange: this.onStreamStateChange,
        // $FlowFixMe
        configuration: mergedConfiguration.videoStreamer || mergedConfiguration
        // TODO: Consider making the config merging part of the Replay composition.
      }
    };
  }
  
  inspectableStreamState: VideoStreamState = {};
  
  inspect = () => this.inspectableStreamState;

  componentWillUnmount() {
    this.inspectableStreamState = {};
    this.observeManager.unobserveAll();
  }

  observeManager = getObserveManager();

  onVideoStreamerReady = (methods: PlaybackMethods) => {
    this.setState({
      gotoLive: methods.gotoLive,
      setPosition: methods.setPosition
    });
  };

  // Video stream -> UI
  onStreamStateChange = (property: VideoStreamState) => {
    //if (!this.isUnmounting) {
    this.observeManager.update(property);
    this.inspectableStreamState = { ...this.inspectableStreamState, ...property };
    //}
  };

  // UI -> video stream
  updateProperty = (updatedProp: PlaybackProps) => {
    const videoStreamerProps = { ...this.state.videoStreamerProps, ...updatedProp };
    this.setState({
      videoStreamerProps
    });
  };

  render() {
    const { gotoLive, setPosition, mergedConfiguration, videoStreamerProps } = this.state;
    const { updateProperty, observeManager } = this;
    const { observe, unobserve } = observeManager;
    const controllerApi = {
      updateProperty,
      gotoLive,
      setPosition,
      videoStreamer: passPropsToVideoStreamer(this.props.children, videoStreamerProps),
      observe,
      inspect: this.inspect,
      unobserve
    };

    return (
      <ControllerContext.Provider value={controllerApi}>
        {this.props.render({ controllerApi, configuration: mergedConfiguration })}
      </ControllerContext.Provider>
    );
  }
}

export default PlayerController;
