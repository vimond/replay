// @flow
import * as React from 'react';
import PlayerController from '../components/player/PlayerController/PlayerController';
import MockVideoStreamer from '../components/player/VideoStreamer/MockVideoStreamer';
import getPlayerUIRenderer from './playerUI';
import graphics from './default-skin/graphics';
import strings from './strings';
import { defaultClassNamePrefix } from '../components/common';
import { baseConfiguration } from './baseConfiguration';

const renderPlayerUI = getPlayerUIRenderer(graphics, strings, defaultClassNamePrefix);

const MockPlayer = ({
  options,
  onExit,
  children
}: { options: any, onExit?: () => void, children?: React.Node } = {}) => (
  <PlayerController configuration={baseConfiguration} options={options} render={renderPlayerUI} externalProps={{ onExit }}>
    <MockVideoStreamer>{children}</MockVideoStreamer>
  </PlayerController>
);

export default MockPlayer;
