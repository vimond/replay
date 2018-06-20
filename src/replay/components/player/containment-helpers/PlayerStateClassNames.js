// @flow
import * as React from 'react';
import type { RecognizedPlayerStateProperties, ClassNameKeys } from './getPlayerStateClassNames';
import getPlayerStateClassNames from './getPlayerStateClassNames';
import type { CommonGenericProps } from '../../common';
import { defaultClassNamePrefix } from '../../common';
import type { StreamStateKeysForObservation } from '../player-controller/ControllerContext';

type Props = RecognizedPlayerStateProperties & CommonGenericProps & {
  children: React.Element<any>,
  classNameDefinitions: { [ClassNameKeys]: string }
};

class PlayerStateClassNames extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };

  static streamStateKeysForObservation: StreamStateKeysForObservation = ['isPaused', 'isSeeking', 'isBuffering', 'isMuted', 'volume', 'isAtLivePosition', 'playState', 'error', 'playMode'];
    
  render() {
    const { children, classNamePrefix, classNameDefinitions, className, ...playerStateProps } = this.props;
    return React.cloneElement(children, { className: getPlayerStateClassNames(playerStateProps, classNameDefinitions, classNamePrefix, className ? [className] : undefined ) });
  }
}

export default PlayerStateClassNames;