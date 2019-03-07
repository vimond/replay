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
  Copy,
  Square,
  Airplay,
  Maximize,
  Minimize,
  XCircle
} from 'react-feather';
import LoadingAnimation from './LoadingAnimation';
import strings from '../strings';

const graphics = {
  playPauseButton: {
    playingContent: <Pause />,
    pausedContent: <Play />
  },
  skipButton: {
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
  gotoLiveButton: {
    isAtLiveEdgeContent: <span>{strings.gotoLiveButton.isLive}</span>,
    isNotAtLiveEdgeContent: <span>{strings.gotoLiveButton.gotoLive}</span>
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
  pipButton: {
    pipActiveContent: <Square />,
    pipInactiveContent: <Copy />
  },
  airPlayButton: {
    airPlayActiveContent: <Airplay />,
    airPlayInactiveContent: <Airplay />
  },
  fullscreenButton: {
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
