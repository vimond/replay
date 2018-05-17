// @flow
import * as React from 'react';

//TODO: All CSS to be referred here.

import '../../components/player/VideoStream/VideoStreamer.css';

// Design/skin neutral styles
import '../../components/controls/core-styles/ControlsBar.css';
import '../../components/controls/core-styles/Volume.css';
import '../../components/generic/core-styles/DropUpSelector.css';
import '../../components/generic/core-styles/Slider.css';
import '../../components/generic/core-styles/Button.css';

// Default skin
import '../default-skin/skin-and-layout.css';

const graphics = {
  playPause: {
    playingContent: 'Pa',
    pausedContent: 'Pl'
  },
  skipBack: {
    content: '‹10'
  },
  timeline: {
    handleContent: '•',
    trackContent: <div />
  },
  gotoLive: {
    isAtLivePositionContent: 'Live',
    isNotAtLivePositionContent: 'Go to live'
  },
  volume: {
    unmutedContent: 'U',
    mutedContent: 'M',
    volumeSliderHandleContent: '•'
  },
  audioSelector: {
    toggleContent: 'A'
  },
  subtitlesSelector: {
    toggleContent: 'T'
  },
  qualitySelector: {
    toggleContent: 'Q'
  },
  fullscreen: {
    normalContent: '‹›',
    fullscreenContent: '›‹'
  },
  bufferingIndicator: {
    content: 'B'
  }
};

export default graphics;