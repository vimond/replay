const strings = {
  playPauseButton: {
    label: 'Toggle play/pause'
  },
  skipButton: {
    label: 'Skip back 10 seconds',
    seconds: '–10'
  },
  timeDisplay: {
    label: 'Video times',
    clockTimeLabel: 'Clock time',
    positionLabel: 'Current time',
    durationLabel: 'Duration',
    negativeMark: '–'
  },
  timeline: {
    label: 'Timeline'
  },
  gotoLiveButton: {
    label: 'Play from live position',
    isLive: 'Live',
    gotoLive: 'Go live'
  },
  volume: {
    label: 'Volume and mute',
    muteToggleLabel: 'Toggle mute',
    volumeSliderLabel: 'Volume setting'
  },
  audioSelector: {
    label: 'Audio track selector'
  },
  subtitlesSelector: {
    label: 'Subtitles selector',
    noSubtitlesLabel: 'No subtitles'
  },
  qualitySelector: {
    label: 'Video quality selector',
    autoLabel: 'Automatic',
    formatBitrateLabel: (bitrate, isPlaying) => `${bitrate} kbps${isPlaying ? ' •' : ''}`
  },
  pipButton: {
    label: 'Toggle picture-in-picture mode'
  },
  airPlayButton: {
    label: 'Select AirPlay device'
  },
  fullscreenButton: {
    label: 'Toggle fullscreen'
  },
  bufferingIndicator: {
    label: 'Video is buffering'
  },
  exitButton: {
    label: 'Exit'
  }
};

export default strings;
