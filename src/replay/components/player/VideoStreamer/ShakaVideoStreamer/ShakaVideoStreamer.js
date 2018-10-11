// @flow
import * as React from 'react';
import getStreamStateUpdater from '../BasicVideoStreamer/streamStateUpdater';
import { applyProperties } from '../BasicVideoStreamer/propertyApplier';
import getTextTrackManager from '../BasicVideoStreamer/textTrackManager';
import getStreamRangeHelper from './streamRangeHelper';
import getAudioTrackManager from '../BasicVideoStreamer/audioTrackManager';
import { handleSourceChange } from './sourceHandler';
import { type CommonGenericProps, prefixClassNames, defaultClassNamePrefix } from '../../../common';
import type { PlaybackProps, VideoStreamerProps } from '../types';
import type { StreamStateUpdater } from '../BasicVideoStreamer/streamStateUpdater';
import type { TextTrackManager } from '../BasicVideoStreamer/textTrackManager';
import type { StreamRangeHelper } from './streamRangeHelper';
import type { AudioTrackManager } from '../BasicVideoStreamer/audioTrackManager';
import type { ShakaPlayer, ShakaRequestFilter, ShakaResponseFilter, ShakaVideoStreamerConfiguration } from './types';
import { cleanup, setup } from './setup';

type Props = CommonGenericProps &
  VideoStreamerProps & {
    shakaRequestFilter: ShakaRequestFilter,
    shakaResponseFilter: ShakaResponseFilter,
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

class ShakaVideoStreamer extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix,
    applyBuiltInStyles: true
  };

  constructor(props: Props) {
    super(props);
    this.videoRef = React.createRef();
    this.streamRangeHelper = getStreamRangeHelper(this.props.configuration && this.props.configuration.liveEdgeMargin); // TODO: Inject/HOCify.
    this.streamStateUpdater = getStreamStateUpdater(this); // TODO: Inject/HOCify.
  }

  shakaPlayer: ShakaPlayer;
  streamStateUpdater: StreamStateUpdater;
  textTrackManager: TextTrackManager;
  audioTrackManager: AudioTrackManager;
  streamRangeHelper: StreamRangeHelper;
  videoRef: { current: null | HTMLVideoElement };

  setProperty = (playbackProps: PlaybackProps) => { //TODO: Inject, probably.
    applyProperties(
      playbackProps,
      this.videoRef,
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
      this.shakaPlayer = setup(videoElement);  // TODO: Inject.
      this.textTrackManager = getTextTrackManager(videoElement, this.streamStateUpdater.onTextTracksChanged); // TODO: Inject.
      this.audioTrackManager = getAudioTrackManager(videoElement, this.streamStateUpdater.onAudioTracksChanged); // TODO: Inject.
    }
  }

  componentWillUnmount() {
    cleanup(this.shakaPlayer); // TODO: Inject.
    if (this.textTrackManager) {
      this.textTrackManager.cleanup();
    }
    if (this.audioTrackManager) {
      this.audioTrackManager.cleanup();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.source !== this.props.source) {
      // TODO: Inject.
      handleSourceChange(this.shakaPlayer, this.props.source, prevProps.source, this.props.shakaRequestFilter, this.props.shakaResponseFilter).then(() => {
        this.streamStateUpdater.startPlaybackSession();
        this.audioTrackManager.handleSourceChange();
        this.textTrackManager.handleNewSourceProps(this.props);

      }).catch(err => this.props.onPlaybackError && this.props.onPlaybackError(err)); // TODO: Ignore interrupted load calls. TODO: Error mapping.
    } else if (prevProps.textTracks !== this.props.textTracks) {
      this.textTrackManager.handleNewSourceProps(this.props);
    }
  }

  // TODO: Render must be different for plain HTML.
  render() {
    const { className, classNamePrefix, applyBuiltInStyles }: Props = this.props;
    const classNames = prefixClassNames(classNamePrefix, baseClassName, className);
    return (
      <video
        autoPlay={true}
        controls={false}
        style={applyBuiltInStyles ? styles : undefined}
        className={classNames}
        ref={this.videoRef}
        {...this.streamStateUpdater.eventHandlers}
      />
    );
  }
}

export default ShakaVideoStreamer;
