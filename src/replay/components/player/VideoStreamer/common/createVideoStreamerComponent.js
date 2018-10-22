// @flow
import * as React from 'react';
import { defaultClassNamePrefix } from '../../../common';
import type { PlaybackProps, VideoStreamerConfiguration, VideoStreamerImplProps } from '../types';
import type { SimplifiedVideoStreamer, StreamerImplementationParts, VideoStreamerRenderer } from './types';
import { renderWithoutSource } from './renderers';

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

type State = {
  videoElementEventHandlers: { [string]: (any) => void },
  render: VideoStreamerRenderer
};

function createVideoStreamerComponent<C: VideoStreamerConfiguration, P: VideoStreamerImplProps<C>, T>(
  name: string,
  resolveImplementation: ResolveImplementation<C, P, T>
) {
  class VideoStreamer extends React.Component<P, State> {
    static defaultProps = {
      classNamePrefix: defaultClassNamePrefix,
      applyBuiltInStyles: true
    };

    constructor(props: P) {
      super(props);
      this.videoRef = React.createRef();
      this.state = {
        videoElementEventHandlers: {},
        render: renderWithoutSource
      };
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
        implementation.startPlaybackSession();
        return implementation
          .handleSourceChange(nextProps, prevProps)
          .then(() => {
            implementation.audioTrackManager.handleSourceChange();
            implementation.textTrackManager.handleSourceChange(nextProps);
          })
          .catch(err => nextProps.onPlaybackError && nextProps.onPlaybackError(err));
      }
    };

    componentDidMount() {
      const videoElement = this.videoRef.current;
      if (videoElement) {
        // $FlowFixMe
        resolveImplementation(this, this.props.configuration, videoElement).then(implementation => {
          this.implementation = implementation;
          const { render, videoElementEventHandlers } = implementation;
          this.setState({
            render,
            videoElementEventHandlers
          });
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
        if (prevProps.source !== this.props.source) {
          this.handleSourceChange(this.props, prevProps);
        } else if (prevProps.textTracks !== this.props.textTracks) {
          implementation.textTrackManager.handleSourceChange(this.props);
        }
      }
    }

    render() {
      const { videoRef } = this;
      const { videoElementEventHandlers, render } = this.state;
      return render(videoRef, videoElementEventHandlers, this.props, baseClassName, styles);
    }
  }

  VideoStreamer.displayName = name;
  return VideoStreamer;
}

export default createVideoStreamerComponent;
