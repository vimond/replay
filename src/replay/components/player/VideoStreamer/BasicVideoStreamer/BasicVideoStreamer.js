// @flow
import * as React from 'react';
import { type CommonGenericProps, prefixClassNames, defaultClassNamePrefix } from '../../../common';
import type { VideoStreamerProps } from '../types';
import getStreamStateUpdater from './streamStateUpdater';
import type { StreamStateUpdater } from './streamStateUpdater';
import processPropChanges from './propsChangeHandler';

type Props = CommonGenericProps &
  VideoStreamerProps & {
    applyBuiltInStyles?: boolean
  };

const baseClassName = 'video-streamer';

const styles = {
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  width: '100%',
  height: '100%',
  margin: '0',
  padding: '0',
  backgroundColor: 'black',
  display: 'inline-block',
  verticalAlign: 'baseline'
};

class BasicVideoStreamer extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix,
    applyBuiltInStyles: true
  };

  constructor(props: Props) {
    super(props);
    this.videoRef = React.createRef();
    this.streamStateUpdater = getStreamStateUpdater(this);
  }
  streamStateUpdater: StreamStateUpdater;
  videoRef: { current: null | HTMLVideoElement };

  gotoLive = () => {
    // TODO. Check for live stream before changing position.
  };

  setPosition = (position: number) => {
    if (this.videoRef.current) {
      this.videoRef.current.currentTime = position;
    }
  };

  componentDidMount() {
    if (this.props.onReady) {
      this.props.onReady({ setPosition: this.setPosition, gotoLive: this.gotoLive });
    }
    this.streamStateUpdater.startPlaybackSession();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.source !== this.props.source) {
      this.streamStateUpdater.startPlaybackSession();
    }
    processPropChanges(this.videoRef, prevProps, this.props);
  }

  /* Special video element event handlers */

  render() {
    const { className, classNamePrefix, source, applyBuiltInStyles }: Props = this.props;
    const classNames = prefixClassNames(classNamePrefix, baseClassName, className);
    if (source && ((typeof source === 'string' && source.length > 0) || source.streamUrl)) {
      return (
        <video
          autoPlay={true}
          controls={false}
          style={applyBuiltInStyles ? styles : undefined}
          className={classNames}
          src={source.streamUrl}
          ref={this.videoRef}
          {...this.streamStateUpdater.eventHandlers}
        />
      );
    } else {
      return <video className={classNames} ref={this.videoRef} src={''} />;
    }
  }
}

export default BasicVideoStreamer;
