// @flow
import * as React from 'react';
import ControllablePlayer from '../components/player/ControllablePlayer';
import MockVideoStream from '../components/player/VideoStream/MockVideoStream';
import { renderPlayerUI } from './DefaultPlayer';

const MockPlayer = () => <ControllablePlayer render={renderPlayerUI} ><MockVideoStream/></ControllablePlayer>;

export default MockPlayer;