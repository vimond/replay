// @flow
import * as React from 'react';
import type { ReplayProps } from './types';
import PlayerController from '../components/player/PlayerController/PlayerController';
import BasicVideoStreamer from '../components/player/VideoStreamer/BasicVideoStreamer/BasicVideoStreamer';
import { baseConfiguration } from './baseConfiguration';
import renderPlayerUI from './playerUI';

const applyStreamer = (children, source, textTracks) =>
  children ? (
    React.cloneElement(children, { source, textTracks })
  ) : (
    <BasicVideoStreamer source={source} textTracks={textTracks} />
  );

// This is the component to be consumed in a full React SPA.
const Replay = ({ source, textTracks, options, onExit, onError, startMuted, startPaused, startVolume, maxBitrate, lockedBitrate, children }: ReplayProps) => (
  <PlayerController
    render={renderPlayerUI}
    configuration={baseConfiguration}
    options={options}
    onStreamerError={onError}
    startMuted={startMuted}
    startPaused={startPaused}
    startVolume={startVolume}
    maxBitrate={maxBitrate}
    lockedBitrate={lockedBitrate}
    externalProps={{ onExit }}>
    {applyStreamer(children, source, textTracks)}
  </PlayerController>
);
export default Replay;
