// @flow
import * as React from 'react';
import type { PlaybackApi, VideoStreamState } from '../VideoStreamer/common';
import type { FullscreenState } from './Fullscreen';

type RenderParameters = {
  handleKeyUp: KeyboardEvent => void
};

type KeyCodes = number | Array<number>;

export type KeyboardShortcutsConfiguration = {
  keyCodes: {
    togglePause?: KeyCodes,
    toggleMute?: KeyCodes,
    toggleFullscreen?: KeyCodes,
    skipBack?: KeyCodes,
    skipForward?: KeyCodes,
    increaseVolume?: KeyCodes,
    decreaseVolume?: KeyCodes
  },
  volumeStep?: number,
  skipOffset?: number
};

type Props = {
  nudge?: () => void,
  configuration?: {
    keyboardShortcuts?: KeyboardShortcutsConfiguration
  },
  videoStreamState?: PlaybackApi,
  fullscreenState?: FullscreenState,
  render: RenderParameters => React.Node
};

const getMatchingOperationFromKeycodeConfig = (config: KeyboardShortcutsConfiguration, keyCode: number): ?string => {
  if (config.keyCodes) {
    return Object.entries(config.keyCodes)
      .filter(entry => !!(entry[1] === keyCode || (Array.isArray(entry[1]) && entry[1].indexOf(keyCode) >= 0)))
      .map(entry => entry[0])[0];
  }
};

class KeyboardShortcuts extends React.Component<Props> {
  handleKeyUp = (keyboardEvent: KeyboardEvent) => {
    const { nudge, configuration, videoStreamState, fullscreenState } = this.props;
    if (configuration && configuration.keyboardShortcuts) {
      const offset = configuration.keyboardShortcuts.skipOffset || 30;
      const volumeStep = configuration.keyboardShortcuts.volumeStep || 0.1;
      const operation = getMatchingOperationFromKeycodeConfig(configuration.keyboardShortcuts, keyboardEvent.keyCode);
      if (operation) {
        switch (operation) {
          case 'togglePause':
            videoStreamState && videoStreamState.updateProperty({ isPaused: !videoStreamState.isPaused });
            break;
          case 'toggleMute':
            videoStreamState && videoStreamState.updateProperty({ isMuted: !videoStreamState.isMuted });
            break;
          case 'toggleFullscreen':
            fullscreenState && fullscreenState.updateProperty({ isFullscreen: !fullscreenState.isFullscreen });
            break;
          case 'skipBack':
            videoStreamState &&
              videoStreamState.position &&
              videoStreamState.setPosition(Math.max(videoStreamState.position - offset, 0));
            break;
          case 'skipForward':
            if (videoStreamState && videoStreamState.duration) {
              const targetPosition = (videoStreamState.position || 0) + offset;
              // Skipping to the very end is just annoying. Skipping to live position makes sense.
              if (targetPosition < videoStreamState.duration || videoStreamState.playMode !== 'ondemand') {
                videoStreamState.setPosition(Math.min(targetPosition, videoStreamState.duration));
              }
            }
            break;
          case 'decreaseVolume':
            videoStreamState &&
              videoStreamState.volume &&
              videoStreamState.updateProperty({ volume: Math.max(videoStreamState.volume - volumeStep, 0) });
            break;
          case 'increaseVolume':
            videoStreamState &&
              videoStreamState.updateProperty({ volume: Math.min(videoStreamState.volume + volumeStep, 1) });
            break;
          default:
          // eslint requires default in switch. Can't see that this is a good case for such a requirement.
        }
        if (nudge) {
          nudge();
        }
        keyboardEvent.preventDefault();
      }
    }
  };

  render() {
    const { handleKeyUp } = this;
    return this.props.render({ handleKeyUp });
  }
}
export default KeyboardShortcuts;
