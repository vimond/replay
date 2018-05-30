// @flow
import * as React from 'react';
import type { VideoStreamerProps, VideoStreamState } from './common';
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

const updateWithDefaultValues = (updater, overrides: VideoStreamState = {}) => {
  if (updater) {
    Object.entries(defaultValues).forEach(entry => {
      updater({ [entry[0]]: entry[0] in overrides ? overrides[entry[0]] : entry[1] });
    });
  }
};

class MockVideoStreamer extends React.Component<VideoStreamerProps> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };
  modifiedStreamState = {};

  updateStreamState = (state: VideoStreamState) => {
    Object.entries(state).forEach(entry => {
      this.modifiedStreamState[entry[0]] = entry[1];
    });
    this.props.onStreamStateChange(state);
  };

  componentDidMount() {
    window.updateVideoState = this.updateStreamState;
    if (this.props.onReady) {
      this.props.onReady({
        play: () => runAsync(this.updateStreamState, { isPaused: false }),
        pause: () => runAsync(this.updateStreamState, { isPaused: true }),
        setPosition: (value: number) => {
          runAsync(this.updateStreamState, { position: value }, 500);
          runAsync(this.updateStreamState, { isAtLivePosition: value > defaultValues.duration - 10 }, 500);
        },
        gotoLive: () => {
          runAsync(this.updateStreamState, { position: defaultValues.duration }, 500);
          runAsync(this.updateStreamState, { isAtLivePosition: true }, 1000);
        }
      });
      updateWithDefaultValues(this.props.onStreamStateChange);
      /*setInterval(() => {
        this.props.onStreamStateChange({ isBuffering: this.isBuffering });
        this.isBuffering = !this.isBuffering;
      }, 5000);*/
    }
  }

  componentDidUpdate(prevProps: VideoStreamerProps) {
    Object.keys(this.props)
      .filter(key => updateableKeys.indexOf(key) >= 0)
      .forEach(key => {
        if (prevProps[key] !== this.props[key]) {
          runAsync(this.updateStreamState, { [updateableProps[key]]: this.props[key] });
        }
      });
    if (this.props.onStreamStateChange !== prevProps.onStreamStateChange) {
      updateWithDefaultValues(this.props.onStreamStateChange, this.modifiedStreamState);
    }
  }

  render() {
    return (
      <div
        className={prefixClassNames(this.props.classNamePrefix, className, mockClassName, this.props.className)}
        style={{ background: '#444', color: 'white', fontWeight: 'bold', paddingTop: '20px' }}>
        Mock video. Is paused? {this.props.isPaused ? 'yes' : 'no'}{' '}
      </div>
    );
  }
}

export default MockVideoStreamer;
