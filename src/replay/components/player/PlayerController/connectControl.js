// @flow
import * as React from 'react';
import ControllerContext from './ControllerContext';
import type { InspectMethod, ObserveMethod, UnobserveMethod, SetPropertiesMethod } from './ControllerContext';
import type { VideoStreamState, VideoStreamStateKeys } from '../VideoStreamer/types';
import type { CommonGenericProps } from '../../common';

type HandleChangeMethod = ({ [VideoStreamStateKeys]: any }) => void;

type PassdownProps = VideoStreamState & {
  setProperties?: SetPropertiesMethod,
  inspect?: InspectMethod
};

type ObserverProps = {
  observe: ObserveMethod,
  unobserve: UnobserveMethod,
  inspect: InspectMethod,
  passdownProps: PassdownProps
};

/*
const getObserver = (callback: HandleChangeMethod) => (key: string, value: any) => {
  callback({ [key]: value });
};
*/
const registerObservers = (observe: ObserveMethod, keys: Array<VideoStreamStateKeys>, onChange: HandleChangeMethod) =>
  keys.forEach(p => observe(p, onChange));

const connectControl = <Props: {}>(
  Control: React.ComponentType<Props>,
  stateKeys?: Array<VideoStreamStateKeys>
): React.ComponentType<$Diff<Props, PassdownProps>> => {
  // $FlowFixMe What's the best practices for extending component classes with static properties?
  const resolvedStateKeys = stateKeys || Control.streamStateKeysForObservation || [];
  if (!Array.isArray(resolvedStateKeys)) {
    // Good old runtime check.
    throw new Error(
      `The component ${Control.displayName ||
        Control.name} cannot be connected to the player controller because no stream state property keys are specified to be observed.`
    );
  }

  class Observer extends React.Component<ObserverProps, any> {
    constructor(props) {
      super(props);
      const currentState = props.inspect();
      const initialState = {};
      if (currentState) {
        resolvedStateKeys.forEach(key => (initialState[key] = currentState[key]));
      }
      this.state = initialState;
    }

    update = prop => this.setState(prop);

    componentWillUnmount() {
      registerObservers(this.props.unobserve, resolvedStateKeys, this.update);
    }

    componentDidMount() {
      registerObservers(this.props.observe, resolvedStateKeys, this.update);
    }

    render() {
      return <Control {...{ ...this.props.passdownProps, ...this.state }} />;
    }
  }

  const ConnectedControl = (props: $Diff<Props, PassdownProps>) => (
    <ControllerContext.Consumer>
      {({ observe, unobserve, setProperties, inspect }) => {
        if (observe) {
          return (
            <Observer
              observe={observe}
              unobserve={unobserve}
              inspect={inspect}
              passdownProps={{ ...props, setProperties, inspect }}
            />
          );
        } else {
          return <Control {...{ ...props, setProperties, inspect }} />;
        }
      }}
    </ControllerContext.Consumer>
  );

  ConnectedControl.displayName = 'Connected' + (Control.displayName || Control.name);
  return ConnectedControl;
};

export const ControlledVideoStreamer: React.StatelessFunctionalComponent<CommonGenericProps> = props => (
  <ControllerContext.Consumer>
    {({ videoStreamer }) => (videoStreamer != null ? React.cloneElement(videoStreamer, props) : null)}
  </ControllerContext.Consumer>
);

export default connectControl;
