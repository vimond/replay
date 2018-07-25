// @flow
import * as React from 'react';
import PlayerController from '../components/player/PlayerController/PlayerController';
import MockVideoStreamer from '../components/player/VideoStreamer/MockVideoStreamer';
import renderPlayerUI from './playerUI';

const MockPlayer = ({
  options,
  onExit,
  children
}: { options: any, onExit?: () => void, children?: React.Node } = {}) => (
  <PlayerController options={options} render={renderPlayerUI} externalProps={{ onExit }}>
    <MockVideoStreamer>{children}</MockVideoStreamer>
  </PlayerController>
);

export default MockPlayer;
