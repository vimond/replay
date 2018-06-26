// @flow
import * as React from 'react';
import type { RecognizedPlayerStateProperties, ClassNameKeys } from './playerStateClassNameBuilder';
import playerStateClassNameBuilder from './playerStateClassNameBuilder';
import type { CommonGenericProps } from '../../common';
import { defaultClassNamePrefix } from '../../common';
import type { StreamStateKeysForObservation } from '../PlayerController/ControllerContext';

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
    // TODO: Consider render prop instead of cloneElement for consistency.
    return React.cloneElement(children, { className: playerStateClassNameBuilder(playerStateProps, classNameDefinitions, classNamePrefix, className ? [className] : undefined ) });
  }
}

export default PlayerStateClassNames;