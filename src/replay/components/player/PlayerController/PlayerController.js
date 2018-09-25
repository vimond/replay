// @flow
import * as React from 'react';
import ControllerContext from './ControllerContext';
import type {
  InitialPlaybackProps,
  PlaybackMethods,
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

type PlayerControllerProps = {
  render: RenderMethod,
  children: React.Node,
  externalProps?: any,
  configuration?: any,
  options?: any,
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

  inspectableStreamState: VideoStreamState = {};

  inspect = () => this.inspectableStreamState;

  mergeConfiguration = memoize(override);

  componentWillUnmount() {
    this.observeManager.unobserveAll();
  }

  observeManager = getObserveManager();

  onVideoStreamerReady = ({ setProperty }: PlaybackMethods) => {
    this.inspectableStreamState = {};
    this.setState({ setProperty });
    /*if (this.props.initialPlaybackProps) {
      const { isPaused, volume, isMuted, lockedBitrate, maxBitrate } = this.props.initialPlaybackProps;
      // Flow requires this silly reconstructions of the props object.
      setProperty({ isPaused, volume, isMuted, lockedBitrate, maxBitrate });
    }*/
  };

  // Video streamer -> UI
  onStreamStateChange = (property: VideoStreamState) => {
    this.observeManager.update(property);
    this.inspectableStreamState = { ...this.inspectableStreamState, ...property };
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
