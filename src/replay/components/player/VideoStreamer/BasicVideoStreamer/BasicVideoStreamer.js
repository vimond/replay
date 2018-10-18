// @xflow
import * as React from 'react';
import { type CommonGenericProps, prefixClassNames, defaultClassNamePrefix } from '../../../common';
import type { PlaybackProps, VideoStreamerProps } from '../types';
import type { TextTrackManager } from './textTrackManager';
import type { StreamRangeHelper } from './streamRangeHelper';
import type { StreamStateUpdater } from './streamStateUpdater';
import type { AudioTrackManager } from './audioTrackManager';
import getStreamStateUpdater from './streamStateUpdater';
import { applyProperties } from '../common/propertyApplier';
import getTextTrackManager from './textTrackManager';
import getStreamRangeHelper from './streamRangeHelper';
import getAudioTrackManager from './audioTrackManager';

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
    this.streamRangeHelper = getStreamRangeHelper(this.props.configuration && this.props.configuration.liveEdgeMargin);
    this.streamStateUpdater = getStreamStateUpdater(this);
  }
  streamStateUpdater: StreamStateUpdater;
  textTrackManager: TextTrackManager;
  audioTrackManager: AudioTrackManager;
  streamRangeHelper: StreamRangeHelper;
  videoRef: { current: null | HTMLVideoElement };

  setProperty = (playbackProps: PlaybackProps) => {
    applyProperties(
      playbackProps,
      this.videoRef,
      null,
      this.streamRangeHelper,
      this.textTrackManager,
      this.audioTrackManager
    );
  };

  componentDidMount() {
    if (this.props.onReady) {
      this.props.onReady({ setProperty: this.setProperty });
    }
    this.streamStateUpdater.startPlaybackSession();
    const videoElement = this.videoRef.current;
    if (videoElement) {
      this.textTrackManager = getTextTrackManager(videoElement, this.streamStateUpdater.onTextTracksChanged);
      this.audioTrackManager = getAudioTrackManager(videoElement, this.streamStateUpdater.onAudioTracksChanged);
    }
  }

  componentWillUnmount() {
    if (this.textTrackManager) {
      this.textTrackManager.cleanup();
    }
    if (this.audioTrackManager) {
      this.audioTrackManager.cleanup();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.source !== this.props.source) {
      this.streamStateUpdater.startPlaybackSession();
      this.audioTrackManager.handleSourceChange();
    }
    if (prevProps.source !== this.props.source || prevProps.textTracks !== this.props.textTracks) {
      this.textTrackManager.handleNewSourceProps(this.props);
    }
  }

  render() {
    const { className, classNamePrefix, source, applyBuiltInStyles }: Props = this.props;
    const classNames = prefixClassNames(classNamePrefix, baseClassName, className);
    const streamUrl = source && (typeof source === 'string' && source.length > 0 ? source : source.streamUrl);
    if (streamUrl) {
      return (
        <video
          autoPlay={true}
          controls={false}
          style={applyBuiltInStyles ? styles : undefined}
          className={classNames}
          src={streamUrl}
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
