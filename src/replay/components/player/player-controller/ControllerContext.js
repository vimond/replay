// @flow
import * as React from 'react';
import type { PlaybackProps, VideoStreamState, VideoStreamStateKeys } from '../VideoStreamer/types';

export type ObserveCallback = ({ [VideoStreamStateKeys]: any }) => void;
export type ObserveMethod = (VideoStreamStateKeys, ObserveCallback) => void;
export type UnobserveMethod = ObserveMethod;
export type InspectMethod = () => VideoStreamState;
export type UpdatePropertyMethod = PlaybackProps => void;
export type GotoLiveMethod = () => void;
export type SetPositionMethod = number => void;

//TODO: Consider removing the following props so that the controls collection doesn't have any bindings to the player controller or video streamer concepts.
export type StreamStateKeysForObservation = Array<VideoStreamStateKeys>;
export type ObservingControlStaticProps = {
  streamStateKeysForObservation?: StreamStateKeysForObservation
};

export type ControllerApi = {
  setPosition: SetPositionMethod,
  gotoLive: GotoLiveMethod,
  updateProperty: UpdatePropertyMethod,
  observe: ?ObserveMethod,
  inspect: InspectMethod,
  videoStreamer: ?React.Node,
  unobserve: ObserveMethod
};
const initialContextValue: ControllerApi = {
  setPosition: () => {},
  gotoLive: () => {},
  updateProperty: () => {},
  videoStreamer: null,
  inspect: () => ({}),
  observe: null,
  unobserve: () => {}
};
const ControllerContext = React.createContext(initialContextValue);

export default ControllerContext;
