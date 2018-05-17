// @flow
import * as React from 'react';
import type { AvailableTrack, VideoStreamProps, VideoStreamState } from './common';
import { defaultClassNamePrefix, prefixClassNames } from '../../common';

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

const defaultValues: VideoStreamState = {
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

const updateableProps = {
  volume: 'volume',
  isMuted: 'isMuted',
  isPaused: 'isPaused',
  maxBitrate: 'maxBitrate',
  lockedBitrate: 'lockedBitrate',
  selectedTextTrack: 'currentTextTrack',
  selectedAudioTrack: 'currentAudioTrack'
};
const updateableKeys = Object.keys(updateableProps);
const className = 'video-streamer';
const mockClassName = 'mock-video-streamer';

const runAsync = (callback, arg, delay = 0) => setTimeout(() => callback && callback(arg), delay);

const updateWithDefaultValues = updater => {
  if (updater) {
    Object.entries(defaultValues).forEach(entry => {
      updater({ [entry[0]]: entry[1] });
    });
  }
};

class MockVideoStream extends React.Component<VideoStreamProps> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };
  
  componentDidMount() {
    if (this.props.onReady) {
      this.props.onReady({
        play: () => runAsync(this.props.onStreamStateChange, { isPaused: false }),
        pause: () => runAsync(this.props.onStreamStateChange, { isPaused: true }),
        setPosition: (value: number) => runAsync(this.props.onStreamStateChange, { position: value }, 1500),
        gotoLive: () => runAsync(this.props.onStreamStateChange, { position: defaultValues.duration }, 1500)
      });
      updateWithDefaultValues(this.props.onStreamStateChange);
    }
  }

  componentDidUpdate(prevProps: VideoStreamProps) {
    Object.keys(this.props)
      .filter(key => updateableKeys.indexOf(key) >= 0)
      .forEach(key => {
        if (prevProps[key] !== this.props[key]) {
          runAsync(this.props.onStreamStateChange, { [updateableProps[key]]: this.props[key] });
        }
      });
    if (this.props.onStreamStateChange !== prevProps.onStreamStateChange) {
      updateWithDefaultValues(this.props.onStreamStateChange);
    }
  }

  render() {
    return (
      <div className={prefixClassNames(this.props.classNamePrefix, className, mockClassName, this.props.className)} style={{ background: '#444', color: 'white', fontWeight: 'bold' }}>
        Mock video. Is paused? {this.props.isPaused ? 'yes' : 'no'}{' '}
      </div>
    );
  }
}

export default MockVideoStream;
