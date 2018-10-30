// @flow
import * as React from 'react';
import type { PlaybackProps, VideoStreamState, VideoStreamStateKeys } from '../VideoStreamer/types';

export type ObserveCallback = ({ [VideoStreamStateKeys]: any }) => void;
export type ObserveMethod = (VideoStreamStateKeys, ObserveCallback) => void;
export type UnobserveMethod = ObserveMethod;
export type InspectMethod = () => VideoStreamState;
export type SetPropertiesMethod = PlaybackProps => void;

export type StreamStateKeysForObservation = Array<VideoStreamStateKeys>;
export type ObservingControlStaticProps = {
  streamStateKeysForObservation?: StreamStateKeysForObservation
};

export type ControllerApi = {
  setProperties: SetPropertiesMethod,
  observe: ?ObserveMethod,
  inspect: InspectMethod,
  videoStreamer: ?React.Element<any>,
  unobserve: ObserveMethod
};
const initialContextValue: ControllerApi = {
  setProperties: () => {},
  videoStreamer: null,
  inspect: () => ({}),
  observe: null,
  unobserve: () => {}
};
const ControllerContext = React.createContext(initialContextValue);

export default ControllerContext;
