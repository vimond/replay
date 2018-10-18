// @flow
import * as React from 'react';
import { defaultClassNamePrefix, prefixClassNames } from '../../../common';
import type { PlaybackProps, VideoStreamerConfiguration, VideoStreamerImplProps } from '../types';
import type { SimplifiedVideoStreamer, StreamerImplementationParts } from './types';

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

type ResolveImplementation<C: VideoStreamerConfiguration, P: VideoStreamerImplProps<C>, T> = (
  component: SimplifiedVideoStreamer<C, P>,
  configuration: ?C,
  videoElement: HTMLVideoElement
) => Promise<StreamerImplementationParts<C, P, T>>;

function createVideoStreamerComponent<C: VideoStreamerConfiguration, P: VideoStreamerImplProps<C>, T>(
  name: string,
  resolveImplementation: ResolveImplementation<C, P, T>
) {
  class VideoStreamer extends React.Component<P> {
    static defaultProps = {
      classNamePrefix: defaultClassNamePrefix,
      applyBuiltInStyles: true
    };

    constructor(props: P) {
      super(props);
      this.videoRef = React.createRef();
    }

    implementation: ?StreamerImplementationParts<C, P, T>;
    videoRef: { current: null | HTMLVideoElement };

    setProperty = (playbackProps: PlaybackProps) => {
      const applyProperties = this.implementation && this.implementation.applyProperties;
      if (applyProperties) {
        applyProperties(playbackProps);
      }
    };

    handleSourceChange = (nextProps: P, prevProps?: P) => {
      const implementation = this.implementation;
      if (implementation) {
        return implementation
          .handleSourceChange(nextProps, prevProps)
          .then(() => {
            implementation.streamStateUpdater.startPlaybackSession();
            implementation.audioTrackManager.handleSourceChange();
            implementation.textTrackManager.handleSourceChange(nextProps);
          })
          .catch(err => nextProps.onPlaybackError && nextProps.onPlaybackError(err)); // TODO: Ignore interrupted load calls. TODO: Error mapping.
      }
    };

    componentDidMount() {
      const videoElement = this.videoRef.current;
      if (videoElement) {
        // $FlowFixMe
        resolveImplementation(this, this.props.configuration, videoElement).then(implementation => {
          this.implementation = implementation;
          if (this.props.source) {
            this.handleSourceChange(this.props);
          }
          if (this.props.onReady) {
            this.props.onReady({ setProperty: this.setProperty });
          }
        }); // TODO: Catch an error.
      }
    }

    componentWillUnmount() {
      if (this.implementation && this.implementation) {
        this.implementation.cleanup(); // TODO: Catch an error.
      }
    }

    componentDidUpdate(prevProps: P) {
      const implementation = this.implementation;
      if (implementation) {
        if (prevProps.source !== this.props.source && implementation) {
          this.handleSourceChange(this.props, prevProps);
        } else if (prevProps.textTracks !== this.props.textTracks) {
          implementation.textTrackManager.handleSourceChange(this.props);
        }
      }
    }
    // TODO: Render must be different for plain HTML, having empty video element on no source.
    // Inject that part. Also consider rendering empty video element if no source.
    render() {
      const { implementation } = this;
      if (implementation == null) {
        return null;
      } else {
        const { className, classNamePrefix, applyBuiltInStyles }: P = this.props;
        const classNames = prefixClassNames(classNamePrefix, baseClassName, className);
        return (
          <video
            autoPlay={true}
            controls={false}
            style={applyBuiltInStyles ? styles : undefined}
            className={classNames}
            ref={this.videoRef}
            {...implementation.streamStateUpdater.eventHandlers}
          />
        );
      }
    }
  }

  VideoStreamer.displayName = name;
  return VideoStreamer;
}

export default createVideoStreamerComponent;
