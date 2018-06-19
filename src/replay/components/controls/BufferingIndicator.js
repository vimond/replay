// @flow
import * as React from 'react';
import { defaultClassNamePrefix, prefixClassNames } from '../common';
import type { PlayState, VideoStreamStateKeys } from '../player/VideoStreamer/types';
import type { CommonProps } from '../common';

type Props = CommonProps & {
  isBuffering?: boolean,
  isSeeking?: boolean,
  playState?: PlayState,
  children?: React.Node,
  content?: React.Node,
  renderStrategy?: 'when-buffering' | 'always'
};

const className = 'buffering-indicator';
const isActiveClassName = 'buffering';

type BufferingIndicatorType = React.StatelessFunctionalComponent<Props> & {
  streamStatePropsToObserve?: Array<string>
};

const BufferingIndicator: BufferingIndicatorType = ({
  children,
  content,
  isBuffering,
  isSeeking,
  playState,
  renderStrategy = 'when-buffering',
  label,
  classNamePrefix = defaultClassNamePrefix
}) => {
  const isActive =
    isBuffering || isSeeking || playState === 'starting' || playState === 'buffering' || playState === 'seeking';
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

BufferingIndicator.streamStatePropsToObserve = ['audioTracks', 'currentAudioTrack'];

export default BufferingIndicator;
