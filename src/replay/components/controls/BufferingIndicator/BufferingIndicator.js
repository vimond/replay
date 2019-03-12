// @flow
import * as React from 'react';
import { defaultClassNamePrefix, prefixClassNames } from '../../common';
import type { PlayState } from '../../player/VideoStreamer/types';
import type { CommonProps } from '../../common';
import type { ObservingControlStaticProps } from '../../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  /** ⇘︎ If true, the buffering indicator is shown or the root element has a class name indicating buffering. */
  isBuffering?: boolean,
  /** ⇘︎ If true, the buffering indicator is shown or the root element has a class name indicating buffering. */
  isSeeking?: boolean,
  /** ⇘︎ If set to 'starting', 'buffering', or 'seeking', the buffering indicator is shown or the root element has a class name indicating buffering. */
  playState?: PlayState,
  /** The content to show if buffering, or always if renderingStrategy is 'always'. */
  children?: React.Node,
  /** Alternative to specifying children. Other Replay controls use content as the convention. */
  content?: React.Node,
  /** When set to 'always', the content is always rendered, but buffering is indicated through a class name on the component's root element. This option is used when controlling display through CSS. */
  renderStrategy?: 'when-buffering' | 'always'
};

const className = 'buffering-indicator';
const isActiveClassName = 'buffering';

type BufferingIndicatorType = React.StatelessFunctionalComponent<Props> & ObservingControlStaticProps;

const BufferingIndicator: BufferingIndicatorType = ({
  children,
  content,
  isBuffering,
  isSeeking,
  playState,
  renderStrategy = 'when-buffering',
  label,
  classNamePrefix = defaultClassNamePrefix
}: Props) => {
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

BufferingIndicator.streamStateKeysForObservation = ['isBuffering', 'isSeeking', 'playState'];
BufferingIndicator.displayName = 'BufferingIndicator';

export default BufferingIndicator;
