// @flow
import * as React from 'react';
import type { PlayMode } from '../VideoStreamer/common';
import type { FullscreenState } from './Fullscreen';
import type { ControllerApi } from '../player-controller/ControllerContext';

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
  isPaused?: ?boolean,
  isMuted?: ?boolean,
  position?: ?number,
  duration?: ?number,
  volume?: ?number,
  playMode?: ?PlayMode,
  controllerApi?: ControllerApi,
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
    const {
      nudge,
      configuration,
      controllerApi,
      fullscreenState,
      isPaused,
      isMuted,
      position,
      duration,
      volume,
      playMode
    } = this.props;
    if (configuration && configuration.keyboardShortcuts) {
      const offset = configuration.keyboardShortcuts.skipOffset || 30;
      const volumeStep = configuration.keyboardShortcuts.volumeStep || 0.1;
      const operation = getMatchingOperationFromKeycodeConfig(configuration.keyboardShortcuts, keyboardEvent.keyCode);
      if (operation) {
        switch (operation) {
          case 'togglePause':
            controllerApi && controllerApi.updateProperty({ isPaused: !isPaused });
            break;
          case 'toggleMute':
            controllerApi && controllerApi.updateProperty({ isMuted: !isMuted });
            break;
          case 'toggleFullscreen':
            fullscreenState && fullscreenState.updateProperty({ isFullscreen: !fullscreenState.isFullscreen });
            break;
          case 'skipBack':
            controllerApi && position != null && controllerApi.setPosition(Math.max(position - offset, 0));
            break;
          case 'skipForward':
            if (controllerApi && duration) {
              const targetPosition = (position || 0) + offset;
              // Skipping to the very end is just annoying. Skipping to live position makes sense.
              if (targetPosition < duration || playMode !== 'ondemand') {
                controllerApi.setPosition(Math.min(targetPosition, duration));
              }
            }
            break;
          case 'decreaseVolume':
            controllerApi &&
              volume != null &&
              controllerApi.updateProperty({ volume: Math.max(volume - volumeStep, 0) });
            break;
          case 'increaseVolume':
            controllerApi &&
              volume != null &&
              controllerApi.updateProperty({ volume: Math.min(volume + volumeStep, 1) });
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
