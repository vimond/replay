// @flow
import * as React from 'react';
import ControllerContext from './ControllerContext';
import type { PlaybackMethods, PlaybackProps, VideoStreamerProps, VideoStreamState } from '../VideoStreamer/common';
import type { ObserveCallback, GotoLiveMethod, SetPositionMethod, ControllerApi } from './ControllerContext';
import { override } from '../../common';

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
  const observers: { [string]: Array<ObserveCallback> } = {};

  const observe = (key: string, callback: ObserveCallback) => {
    if (!(key in observers)) {
      observers[key] = [];
    }
    observers[key].push(callback);
  };

  const unobserve = (key: string, callback: ObserveCallback) => {
    //TODO: What if this.setState is identical across elements?
    if (Array.isArray(observers[key])) {
      const index = observers[key].indexOf(callback);
      if (index !== -1) {
        observers[key].splice(index, 1);
      }
    }
  };

  const unobserveAll = () => {
    Object.entries(observers).forEach(entry => {
      const arr = Array.isArray(entry[1]) ? entry[1] : [];
      while (arr.length) {
        arr.pop();
      }
    });
  };

  const update = (prop: VideoStreamState) => {
    Object.entries(prop).forEach(entry => {
      if (Array.isArray(observers[entry[0]])) {
        observers[entry[0]].forEach(callback => {
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

  componentWillUnmount() {
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
