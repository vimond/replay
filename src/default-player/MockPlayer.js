// @flow
import * as React from 'react';
import PlayerController from '../components/player/PlayerController';
import MockVideoStream from '../components/player/VideoStream/MockVideoStream';
import { renderPlayerUI } from './DefaultPlayer';

const MockPlayer = () => <PlayerController render={renderPlayerUI} ><MockVideoStream/></PlayerController>;

export default MockPlayer;