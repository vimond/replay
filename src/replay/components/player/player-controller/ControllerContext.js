// @flow
import * as React from 'react';
import type { PlaybackProps } from '../VideoStreamer/common';

export type ObserveCallback = ({ [string]: any }) => void;
export type ObserveMethod = (string, ObserveCallback) => void;
export type UnobserveMethod = ObserveMethod;
export type UpdatePropertyMethod = PlaybackProps => void;
export type GotoLiveMethod = () => void;
export type SetPositionMethod = number => void;

export type ControllerApi = {
  setPosition: SetPositionMethod,
  gotoLive: GotoLiveMethod,
  updateProperty: UpdatePropertyMethod,
  observe: ?ObserveMethod,
  videoStreamer: ?React.Node,
  unobserve: ObserveMethod
};

const ControllerContext = 
  React.createContext<ControllerApi>({ 
      setPosition: () => {}, 
      gotoLive: () => {}, 
      updateProperty: () => {},
      videoStreamer: null,
      observe: null, 
      unobserve: () => {} 
    });

export default ControllerContext;
