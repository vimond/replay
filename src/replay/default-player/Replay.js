// @flow
import * as React from 'react';
import BasicVideoStreamer from '../components/player/VideoStreamer/BasicVideoStreamer/BasicVideoStreamer';
import { baseConfiguration } from './baseConfiguration';
import createCustomPlayer from '../customizer';
import graphics from './default-skin/graphics';
import strings from './strings';
import type { ResolveVideoStreamerMethod } from '../customizer';

const applyStreamer: ResolveVideoStreamerMethod = (Component, children, source, textTracks) =>
  children ? (
    React.cloneElement(children, { source, textTracks })
  ) : (
    <BasicVideoStreamer source={source} textTracks={textTracks} />
  );

const Replay = createCustomPlayer({
  name: 'Replay',
  graphics,
  strings,
  resolveVideoStreamerMethod: applyStreamer,
  configuration: baseConfiguration // Already added as default value.
});

// This is the component to be consumed in a full React SPA.
export default Replay;
