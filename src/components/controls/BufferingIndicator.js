// @flow
import * as React from 'react';
import { defaultClassNamePrefix, prefixClassNames } from '../common';
import type { PlayState } from '../player/VideoStream/common';
import type { CommonProps } from '../common';

type Props = CommonProps & {
  isBuffering?: boolean,
  playState?: PlayState,
  children?: React.Node,
  content?: React.Node,
  renderStrategy?: 'when-buffering' | 'always'
};

const className = 'buffering-indicator';
const isActiveClassName = 'buffering';

const BufferingIndicator: React.StatelessFunctionalComponent<Props> = ({
  children,
  content,
  isBuffering,
  playState,
  renderStrategy = 'when-buffering',
  label,
  classNamePrefix = defaultClassNamePrefix
}) => {
  const isActive = isBuffering || playState === 'starting' || playState === 'buffering';
  if (renderStrategy === 'always') {
    if (isActive) {
      return (
        <div title={label} className={prefixClassNames(classNamePrefix, className, isActiveClassName)}>
          {children || content}
        </div>
      );
    } else {
      return <div className={prefixClassNames(classNamePrefix, className)}>{children || content}</div>;
    }
  } else {
    if (isActive) {
      return (
        <div title={label} className={prefixClassNames(classNamePrefix, className, isActiveClassName)}>
          {children || content}
        </div>
      );
    } else {
      return null;
    }
  }
};

export default BufferingIndicator;
