// @flow 
import * as React from 'react';
import { defaultClassNamePrefix, prefixClassNames } from '../common';
import type { PlayState } from '../player/VideoStream/common';
import type { CommonProps } from '../common';

type Props = CommonProps & {
  isBuffering?: boolean,
  playState?: PlayState,
  children?: React.Node,
  content?: React.Node
};

const className = 'buffering-indicator';

const BufferingIndicator : React.StatelessFunctionalComponent<Props> = ({ children, content, isBuffering, playState, label, classNamePrefix = defaultClassNamePrefix}) => {
  if (isBuffering || playState === 'starting' || playState === 'buffering') {
    return <div title={label} className={prefixClassNames(classNamePrefix, className)}>{children || content}</div>;
  } else {
    return null;
  }
};

export default BufferingIndicator;