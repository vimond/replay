// @flow
import * as React from 'react';
import type { PlaybackProps, VideoStreamerProps, VideoStreamState } from './types';
import { defaultClassNamePrefix, prefixClassNames } from '../../common';

type Props = VideoStreamerProps & {
  children?: React.Node
};

const defaultTextTracks = [
  {
    kind: 'subtitles',
    label: 'Finnish subtitles',
    language: 'fi',
    origin: 'side-loaded'
  },
  {
    kind: 'subtitles',
    label: 'Swedish subtitles',
    language: 'sv',
    origin: 'side-loaded'
  }
];

const defaultAudioTracks = [
  {
    label: "Director's comments",
    language: 'en'
  },
  {
    label: 'Main audio',
    language: 'en'
  }
];

const defaultValues = {
  playMode: 'livedvr',
  playState: 'playing',
  isPaused: false,
  isBuffering: false,
  isSeeking: false,
  position: 123,
  duration: 456,
  absolutePosition: undefined,
  absoluteStartPosition: undefined,
  volume: 0.7,
  isMuted: false,
  bufferedAhead: 12,
  bitrates: [512, 1024, 2048, 4096],
  currentBitrate: 2048,
  lockedBitrate: NaN,
  maxBitrate: Infinity,
  textTracks: defaultTextTracks,
  currentTextTrack: defaultTextTracks[0],
  audioTracks: defaultAudioTracks,
  currentAudioTrack: defaultAudioTracks[0],
  isAtLivePosition: false,
  error: undefined
};
/*
	volume?: number,
	isMuted?: boolean,
	isPaused?: boolean,
	maxBitrate?: number,
	lockedBitrate?: number | string,
	selectedTextTrack?: AvailableTrack,
	selectedAudioTrack?: AvailableTrack,
*/

const className = 'video-streamer';
const mockClassName = 'mock-video-streamer';

const runAsync = (callback, arg, delay = 0) => { setTimeout(() => callback && callback(arg), delay) };

const updateWithDefaultValues = (updater, overrides: VideoStreamState = {}) => {
  if (updater) {
    Object.entries(defaultValues).forEach(entry => {
      updater({ [entry[0]]: entry[0] in overrides ? overrides[entry[0]] : entry[1] });
    });
  }
};

class MockVideoStreamer extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };
  modifiedStreamState = {};

  updateStreamState = (props: PlaybackProps) => {
    const { selectedTextTrack, selectedAudioTrack, ...unchanged } = props;
    // $FlowFixMe Subset type and question marks don't work.
    const newState: VideoStreamState = unchanged;
    if ('selectedTextTrack' in props) {
      newState.currentTextTrack = selectedTextTrack;
    }
    if ('selectedAudioTrack' in props) {
      newState.currentAudioTrack = selectedAudioTrack;
    }
    this.modifiedStreamState = { ...this.modifiedStreamState, ...newState };
    if (this.props.onStreamStateChange != null) {
      this.props.onStreamStateChange(newState);
    }
  };

  componentDidMount() {
    if (this.props.initialPlaybackProps) {
      const { isPaused, isMuted, volume, maxBitrate, lockedBitrate } = this.props.initialPlaybackProps;
      this.updateStreamState({ isPaused, isMuted, volume, maxBitrate, lockedBitrate  });
    }
    window.updateVideoState = this.updateStreamState;
    if (this.props.onReady) {
      this.props.onReady({
        setProperty: (props: PlaybackProps) => runAsync(this.updateStreamState, props, Math.round(Math.random()*1000))
      });
      updateWithDefaultValues(this.props.onStreamStateChange);
      /*setInterval(() => {
        this.props.onStreamStateChange({ isBuffering: this.isBuffering });
        this.isBuffering = !this.isBuffering;
      }, 5000);*/
    }
  }

  componentDidUpdate(prevProps: VideoStreamerProps) {
    if (this.props.onStreamStateChange !== prevProps.onStreamStateChange) {
      updateWithDefaultValues(this.props.onStreamStateChange, this.modifiedStreamState);
    }
  }

  render() {
    return (
      <div
        className={prefixClassNames(this.props.classNamePrefix, className, mockClassName, this.props.className)}
        style={{ background: '#444', color: 'white', fontWeight: 'bold', paddingTop: '20px' }}>
        {this.props.children || 'Mock video player'}
      </div>
    );
  }
}

export default MockVideoStreamer;
