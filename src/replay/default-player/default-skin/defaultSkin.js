// @flow
import * as React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  MessageSquare,
  Type,
  Settings,
  Maximize,
  Minimize,
  XCircle
} from 'react-feather';
import LoadingAnimation from './LoadingAnimation';
import { strings } from '../strings';

// Design/skin agnostic core styles
import '../../components/player/VideoStreamer/VideoStreamer.css';
import '../../components/controls/core-styles/ControlsBar.css';
import '../../components/controls/core-styles/Volume.css';
import '../../components/generic/core-styles/DropUpSelector.css';
import '../../components/generic/core-styles/Slider.css';
import '../../components/generic/core-styles/Button.css';
import '../../components/controls/core-styles/PlaybackMonitor.css';

// Default skin
import './skinAndLayout.css';

const graphics = {
  playPause: {
    playingContent: <Pause />,
    pausedContent: <Play />
  },
  skipBack: {
    content: (
      <React.Fragment>
        <span>
          <RotateCcw />
        </span>
        <span>{strings.skipButton.seconds}</span>
      </React.Fragment>
    )
  },
  timeline: {
    handleContent: '',
    trackContent: <div />
  },
  gotoLive: {
    isAtLivePositionContent: <span>{strings.gotoLiveButton.isLive}</span>,
    isNotAtLivePositionContent: <span>{strings.gotoLiveButton.gotoLive}</span>
  },
  volume: {
    unmutedContent: <Volume2 />,
    mutedContent: <VolumeX />,
    volumeSliderHandleContent: ''
  },
  audioSelector: {
    toggleContent: <MessageSquare />
  },
  subtitlesSelector: {
    toggleContent: <Type />
  },
  qualitySelector: {
    toggleContent: <Settings />
  },
  fullscreen: {
    normalContent: <Maximize />,
    fullscreenContent: <Minimize />
  },
  bufferingIndicator: {
    content: <LoadingAnimation />,
    renderStrategy: 'always'
  },
  playbackMonitor: {
    closeButtonContent: <XCircle />
  },
  exitButton: {
    content: <XCircle />
  }
};

export default graphics;
