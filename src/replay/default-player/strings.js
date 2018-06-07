export const labels = {
  playPause: {
    label: 'Toggle play/pause'
  },
  skipBack: {
    label: 'Skip back 10 seconds'
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
  gotoLive: {
    label: 'Play from live position'
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
  fullscreen: {
    label: 'Toggle fullscreen'
  },
  bufferingIndicator: {
    label: 'Video is buffering'
  },
  exit: {
    label: 'Exit'
  },
};

export const strings = {
  gotoLiveButton: {
    isLive: 'Live',
    gotoLive: 'Go live'
  },
  skipButton: {
    seconds: '–10'
  }
};
