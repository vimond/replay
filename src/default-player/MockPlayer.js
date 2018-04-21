// @flow
import * as React from 'react';
import withVideoStream from '../components/player/ControllablePlayer';
import MockVideoStream from '../components/player/VideoStream/MockVideoStream';
import { renderPlayerWithUi } from './DefaultPlayer';


const ControllablePlayer = withVideoStream(MockVideoStream, {});

const MockPlayer = () => <ControllablePlayer render={renderPlayerWithUi} />;

export default MockPlayer;