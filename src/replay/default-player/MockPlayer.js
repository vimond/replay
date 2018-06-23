// @flow
import * as React from 'react';
import PlayerController from '../components/player/PlayerController/PlayerController';
import MockVideoStreamer from '../components/player/VideoStreamer/MockVideoStreamer';
import renderPlayerUI from './playerUI';

const MockPlayer = () => (
  <PlayerController render={renderPlayerUI}>
    <MockVideoStreamer />
  </PlayerController>
);

export default MockPlayer;
