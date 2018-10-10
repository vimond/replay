// @flow
import * as React from 'react';
import { type CommonGenericProps, prefixClassNames, defaultClassNamePrefix } from '../../../common';
import type { PlaybackProps, VideoStreamerProps } from '../types';
import shaka from 'shaka-player';

import getStreamStateUpdater from '../BasicVideoStreamer/streamStateUpdater';
import type { StreamStateUpdater } from '../BasicVideoStreamer/streamStateUpdater';
import { applyProperties } from '../BasicVideoStreamer/propertyApplier';
import getTextTrackManager from '../BasicVideoStreamer/textTrackManager';
import type { TextTrackManager } from '../BasicVideoStreamer/textTrackManager';
import type { StreamRangeHelper } from '../BasicVideoStreamer/streamRangeHelper';
import getStreamRangeHelper from '../BasicVideoStreamer/streamRangeHelper';
import type { AudioTrackManager } from '../BasicVideoStreamer/audioTrackManager';
import getAudioTrackManager from '../BasicVideoStreamer/audioTrackManager';
import { handleSourceChange } from './helpers';
import type { ShakaRequestFilter, ShakaResponseFilter } from './types';

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

function setup(videoElement, configuration: any) {
  const shakaPlayer = new shaka.Player(videoElement);
  if (configuration) {
    shakaPlayer.configure(configuration);
  }
  return shakaPlayer;
}

function cleanup(shakaPlayer) {
  if (shakaPlayer) {
    shakaPlayer.destroy();
  }
}

class ShakaVideoStreamer extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix,
    applyBuiltInStyles: true
  };

  constructor(props: Props) {
    super(props);
    this.videoRef = React.createRef();
    this.streamRangeHelper = getStreamRangeHelper(); // TODO: Add configuration parameters.
    this.streamStateUpdater = getStreamStateUpdater(this);
    if (this.props.configuration) {
      if (this.props.configuration.addPolyfills) {
        shaka.polyfill.installAll();
      }
    }
  }

  shakaPlayer: any;
  streamStateUpdater: StreamStateUpdater;
  textTrackManager: TextTrackManager;
  audioTrackManager: AudioTrackManager;
  streamRangeHelper: StreamRangeHelper;
  videoRef: { current: null | HTMLVideoElement };

  setProperty = (playbackProps: PlaybackProps) => {
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
      this.shakaPlayer = setup(videoElement);
      if (this.props.configuration && this.props.configuration.shakaPlayer) {
        this.shakaPlayer.configure(this.props.configuration.shakaPlayer);
      }
      this.textTrackManager = getTextTrackManager(videoElement, this.streamStateUpdater.onTextTracksChanged);
      this.audioTrackManager = getAudioTrackManager(videoElement, this.streamStateUpdater.onAudioTracksChanged);
    }
  }

  componentWillUnmount() {
    cleanup(this.shakaPlayer);
    if (this.textTrackManager) {
      this.textTrackManager.cleanup();
    }
    if (this.audioTrackManager) {
      this.audioTrackManager.cleanup();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.source !== this.props.source) {
      handleSourceChange(this.shakaPlayer, this.props.source, prevProps.source, this.props.shakaRequestFilter, this.props.shakaResponseFilter, this.streamStateUpdater.registerStartTime).then(() => {
        this.streamStateUpdater.startPlaybackSession();
        this.audioTrackManager.handleSourceChange();
        this.textTrackManager.handleNewSourceProps(this.props);

      }).catch(err => this.props.onPlaybackError && this.props.onPlaybackError(err)); // TODO: Error mapping.
    } else if (prevProps.textTracks !== this.props.textTracks) {
      this.textTrackManager.handleNewSourceProps(this.props);
    }
  }

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
