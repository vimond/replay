// @flow

import * as React from 'react';
import ControllerContext from './ControllerContext';
import type { ObserveMethod, UnobserveMethod } from './ControllerContext';
import type { PlaybackProps, VideoStreamStateKeys } from '../VideoStreamer/types';

type HandleChangeMethod = ({ [VideoStreamStateKeys]: any }) => void;

type PassdownProps = any & {
  updateProperty: PlaybackProps => void,
  gotoLive: () => void,
  setPosition: number => void
};

type ObserverProps = {
  observe: ObserveMethod,
  unobserve: UnobserveMethod,
  passdownProps: PassdownProps
};

/*
const getObserver = (callback: HandleChangeMethod) => (key: string, value: any) => {
  callback({ [key]: value });
};
*/
const registerObservers = (observe: ObserveMethod, keys: Array<VideoStreamStateKeys>, onChange: HandleChangeMethod) =>
  keys.forEach(p => observe(p, onChange));

const connectControl = (Control: any, propKeys?: Array<VideoStreamStateKeys>) => {
  const resolvedPropKeys = propKeys || Control.streamStateKeysForObservation;
  if (!Array.isArray(resolvedPropKeys)) { // Good old runtime check.
    throw new Error(
      `The component ${Control.displayName ||
        Control.name} cannot be connected to the player controller because no stream state property keys are specified to be observed.`
    );
  }

  class Observer extends React.Component<ObserverProps, any> {
    constructor(props) {
      super(props);
      registerObservers(props.observe, resolvedPropKeys, this.setState);
    }

    componentWillUnmount() {
      registerObservers(this.props.unobserve, resolvedPropKeys, this.setState);
    }

    render() {
      return <Control {...{ ...this.props.passdownProps, ...this.state }} />;
    }
  }

  const ConnectedControl = (props: any) => (
    <ControllerContext.Consumer>
      {({ observe, unobserve, updateProperty, gotoLive, setPosition }) => {
        return observe ? (
          <Observer
            observe={observe}
            unobserve={unobserve}
            passdownProps={{ ...props, gotoLive, setPosition, updateProperty }}
          />
        ) : null;
      }}
    </ControllerContext.Consumer>
  );

  ConnectedControl.displayName = 'Connected' + (Control.displayName || Control.name);
  return ConnectedControl;
};

export default connectControl;
