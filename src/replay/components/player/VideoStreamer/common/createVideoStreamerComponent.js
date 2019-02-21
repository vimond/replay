// @flow
import * as React from 'react';
import { defaultClassNamePrefix } from '../../../common';
import type { PlaybackProps, VideoStreamerConfiguration, VideoStreamerImplProps } from '../types';
import type {
  SimplifiedVideoStreamer,
  StreamerImplementationParts,
  TrackElementData,
  VideoStreamerRenderer
} from './types';
import { renderWithoutSource } from './renderers';

const baseClassName = 'video-streamer';

type ResolveImplementation<C: VideoStreamerConfiguration, P: VideoStreamerImplProps<C>, T> = (
  component: SimplifiedVideoStreamer<C, P>,
  configuration: ?C,
  videoElement: HTMLVideoElement,
  onTrackElementDataChange: (?Array<TrackElementData>) => void
) => Promise<StreamerImplementationParts<C, P, T>>;

type State = {
  videoElementEventHandlers: { [string]: (any) => void },
  trackElementData?: ?Array<TrackElementData>,
  render: VideoStreamerRenderer
};

function createVideoStreamerComponent<C: VideoStreamerConfiguration, P: VideoStreamerImplProps<C>, T>(
  name: string,
  resolveImplementation: ResolveImplementation<C, P, T>
) {
  class VideoStreamer extends React.Component<P, State> {
    static defaultProps = {
      classNamePrefix: defaultClassNamePrefix
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

    setProperties = (playbackProps: PlaybackProps) => {
      const applyProperties = this.implementation && this.implementation.applyProperties;
      if (applyProperties) {
        applyProperties(playbackProps);
      }
    };

    handleTrackElementDataChange = (trackElementData: ?Array<TrackElementData>) => {
      this.setState({ trackElementData });
    };

    handleSourceChange = (nextProps: P, prevProps?: P) => {
      const implementation = this.implementation;
      if (implementation) {
        implementation.startPlaybackSession();
        implementation.textTrackManager.clear();
        return implementation
          .handleSourceChange(nextProps, prevProps)
          .then(() => {
            implementation.audioTrackManager.handleSourceChange();
            implementation.textTrackManager.handleSourcePropChange(nextProps);
          })
          .catch(err => {
            implementation.endPlaybackSession('dead');
            return nextProps.onPlaybackError && nextProps.onPlaybackError(err);
          });
      }
    };

    componentDidMount() {
      const videoElement = this.videoRef.current;
      if (videoElement) {
        resolveImplementation(this, this.props.configuration, videoElement, this.handleTrackElementDataChange)
          .then(implementation => {
            this.implementation = implementation;
            const { render, videoElementEventHandlers, thirdPartyPlayer } = implementation;
            this.setState({
              render,
              videoElementEventHandlers
            });
            if (this.props.onReady) {
              this.props.onReady({ setProperties: this.setProperties, thirdPartyPlayer });
            }
            if (this.props.source) {
              return this.handleSourceChange(this.props);
            }
          })
          .catch(err => {
            throw err;
          });
      }
    }

    componentWillUnmount() {
      const videoElement = this.videoRef.current;
      if (videoElement) {
        // $FlowFixMe
        if (videoElement === document.pictureInPictureElement) {
          // $FlowFixMe
          return document.exitPictureInPicture();
          // $FlowFixMe
        } else if (
          // $FlowFixMe
          videoElement.webkitPresentationMode === 'picture-in-picture' && // $FlowFixMe
          typeof videoElement.webkitSetPresentationMode === 'function'
        ) {
          // $FlowFixMe
          videoElement.webkitSetPresentationMode('inline');
        }
      }
      if (this.implementation && this.implementation.cleanup) {
        return this.implementation.cleanup().catch(err => {
          throw err;
        });
      }
    }

    getSnapshotBeforeUpdate() {
      const previousVideoElement = this.videoRef.current;
      // $FlowFixMe: Type defs not up-to-date.
      const pipElement = document.pictureInPictureElement;
      // $FlowFixMe
      const presentationMode = previousVideoElement.webkitPresentationMode;
      const wasPipActive = previousVideoElement === pipElement || presentationMode === 'picture-in-picture'; // $FlowFixMe
      return {
        wasPipActive,
        previousVideoElement: this.videoRef.current
      };
    }

    componentDidUpdate(
      prevProps: P,
      prevState: State,
      snapshot?: { wasPipActive: boolean, previousVideoElement: HTMLVideoElement }
    ) {
      const implementation = this.implementation;
      if (implementation) {
        if (prevProps.source !== this.props.source) {
          if (snapshot && snapshot.wasPipActive) {
            // $FlowFixMe
            if (document.exitPictureInPicture) {
              document
                .exitPictureInPicture()
                .then(
                  () => this.handleSourceChange(this.props, prevProps),
                  () => this.handleSourceChange(this.props, prevProps)
                );
            } else if (
              snapshot.previousVideoElement &&
              // $FlowFixMe
              typeof snapshot.previousVideoElement.webkitSetPresentationMode === 'function'
            ) {
              snapshot.previousVideoElement.webkitSetPresentationMode('inline');
              this.handleSourceChange(this.props, prevProps);
            }
          } else {
            this.handleSourceChange(this.props, prevProps);
          }
        } else if (prevProps.textTracks !== this.props.textTracks) {
          implementation.textTrackManager.handleTextTracksPropChange(this.props);
        }
      }
    }

    render() {
      const { videoRef } = this;
      const { videoElementEventHandlers, render, trackElementData } = this.state;
      const playsInline = !this.props.configuration || this.props.configuration.playsInline == null || this.props.configuration.playsInline;
      return render(videoRef, videoElementEventHandlers, this.props, baseClassName, playsInline, trackElementData);
    }
  }

  VideoStreamer.displayName = name;
  return VideoStreamer;
}

export default createVideoStreamerComponent;
