// @flow
import * as React from 'react';
import { type CommonGenericProps, prefixClassNames, defaultClassNamePrefix } from '../../common';
import type { VideoStreamerProps } from './types';

type Props = CommonGenericProps & VideoStreamerProps;

const baseClassName = 'video-stream';

//TODO: Implement

class BasicVideoStreamer extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };
  gotoLive() {}

  setPosition() {}

  // onReady!

  render() {
    const { className, classNamePrefix, source }: Props = this.props;
    const classNames = prefixClassNames(classNamePrefix, baseClassName, className);
    if (source && source.streamUrl) {
      return <video className={classNames} src={source.streamUrl} />;
    } else {
      return <video className={classNames} />;
    }
  }
}

export default BasicVideoStreamer;
