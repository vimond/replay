// @flow
import * as React from 'react';
import PlayerController from '../components/player/player-controller/PlayerController';
import MockVideoStreamer from '../components/player/VideoStreamer/MockVideoStreamer';
import { renderPlayerUI } from './Replay';

const MockPlayer = () => (
  <PlayerController render={renderPlayerUI}>
    <MockVideoStreamer />
  </PlayerController>
);

export default MockPlayer;
