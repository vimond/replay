// @flow
import * as React from 'react';
import type { RecognizedPlayerStateProperties, ClassNameKeys } from './playerStateClassNameBuilder';
import playerStateClassNameBuilder from './playerStateClassNameBuilder';
import type { CommonGenericProps } from '../../common';
import { defaultClassNamePrefix } from '../../common';
import type { StreamStateKeysForObservation } from '../PlayerController/ControllerContext';

type Props = RecognizedPlayerStateProperties &
  CommonGenericProps & {
    render: string => React.Node,
    classNameDefinitions: { [ClassNameKeys]: string },
    extraClassNames: Array<string>
  };

class PlayerStateClassNames extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix,
    extraClassNames: []
  };

  static streamStateKeysForObservation: StreamStateKeysForObservation = [
    'isPaused',
    'isSeeking',
    'isBuffering',
    'isMuted',
    'volume',
    'isAtLiveEdge',
    'playState',
    'error',
    'playMode'
  ];

  render() {
    const {
      render,
      classNamePrefix,
      classNameDefinitions,
      className,
      extraClassNames,
      ...playerStateProps
    } = this.props;
    return render(
      playerStateClassNameBuilder(
        playerStateProps,
        classNameDefinitions,
        classNamePrefix,
        className ? [className, ...extraClassNames] : extraClassNames
      )
    );
  }
}

export default PlayerStateClassNames;
