// @flow
import * as React from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, MessageSquare, Type, BarChart, Maximize, Minimize } from 'react-feather';
import LoadingAnimation from './LoadingAnimation';
import { strings } from '../strings';

//TODO: All CSS to be referred here.

// Design/skin agnostic core styles
import '../../components/player/VideoStream/VideoStreamer.css';
import '../../components/controls/core-styles/ControlsBar.css';
import '../../components/controls/core-styles/Volume.css';
import '../../components/generic/core-styles/DropUpSelector.css';
import '../../components/generic/core-styles/Slider.css';
import '../../components/generic/core-styles/Button.css';

// Default skin
import '../default-skin/skin-and-layout.css';

const graphics = {
  playPause: {
    playingContent: <Pause/>,
    pausedContent: <Play/>
  },
  skipBack: {
    content: <React.Fragment><span><RotateCcw/></span><span>{strings.skipButton.seconds}</span></React.Fragment>
  },
  timeline: {
    handleContent: '',
    trackContent: <div/>
  },
  gotoLive: {
    isAtLivePositionContent: <React.Fragment><span>{strings.gotoLiveButton.isLive}</span></React.Fragment>,
    isNotAtLivePositionContent: <React.Fragment><span><RotateCw/></span><span>{strings.gotoLiveButton.gotoLive}</span></React.Fragment>
  },
  volume: {
    unmutedContent: <Volume2/>,
    mutedContent: <VolumeX/>,
    volumeSliderHandleContent: ''
  },
  audioSelector: {
    toggleContent: <MessageSquare/>
  },
  subtitlesSelector: {
    toggleContent: <Type/>
  },
  qualitySelector: {
    toggleContent: <BarChart/>
  },
  fullscreen: {
    normalContent: <Maximize/>,
    fullscreenContent: <Minimize/>
  },
  bufferingIndicator: {
    content: <LoadingAnimation/>
  }
};

export default graphics;