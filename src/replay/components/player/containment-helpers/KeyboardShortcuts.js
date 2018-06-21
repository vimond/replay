// @flow
import * as React from 'react';
import type { PlayMode } from '../VideoStreamer/types';
import type { FullscreenState } from './Fullscreen';
import type { InspectMethod } from '../player-controller/ControllerContext';

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

type UpdateableProperties = { volume: number } | { isMuted: boolean } | { isPaused: boolean };

type Props = {
  nudge?: () => void,
  configuration?: {
    keyboardShortcuts?: KeyboardShortcutsConfiguration
  },
  playMode?: ?PlayMode,
  updateProperty?: UpdateableProperties => void,
  setPosition?: number => void,
  fullscreenState?: FullscreenState,
  render: RenderParameters => React.Node,
  isPaused?: ?boolean,
  isMuted?: ?boolean,
  position?: ?number,
  duration?: ?number,
  volume?: ?number,
  inspect?: InspectMethod
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
    let {
      nudge,
      configuration,
      updateProperty,
      setPosition,
      fullscreenState,
      isPaused,
      isMuted,
      position,
      duration,
      volume,
      playMode,
      inspect
    } = this.props;
    if (inspect) {
      const inspectedState = inspect();
      isPaused = inspectedState.isPaused;
      isMuted = inspectedState.isMuted;
      position = inspectedState.position;
      duration = inspectedState.duration;
      volume = inspectedState.volume;
      playMode = inspectedState.playMode;
    }
    
    if (configuration && configuration.keyboardShortcuts) {
      const offset = configuration.keyboardShortcuts.skipOffset || 30;
      const volumeStep = configuration.keyboardShortcuts.volumeStep || 0.1;
      const operation = getMatchingOperationFromKeycodeConfig(configuration.keyboardShortcuts, keyboardEvent.keyCode);
      if (operation) {
        switch (operation) {
          case 'togglePause':
            updateProperty && updateProperty({ isPaused: !isPaused });
            break;
          case 'toggleMute':
            updateProperty && updateProperty({ isMuted: !isMuted });
            break;
          case 'toggleFullscreen':
            fullscreenState && fullscreenState.updateProperty({ isFullscreen: !fullscreenState.isFullscreen });
            break;
          case 'skipBack':
            setPosition && position != null && setPosition(Math.max(position - offset, 0));
            break;
          case 'skipForward':
            if (setPosition && duration) {
              const targetPosition = (position || 0) + offset;
              // Skipping to the very end is just annoying. Skipping to live position makes sense.
              if (targetPosition < duration || playMode !== 'ondemand') {
                setPosition(Math.min(targetPosition, duration));
              }
            }
            break;
          case 'decreaseVolume':
            updateProperty &&
              volume != null &&
              updateProperty({ volume: Math.max(volume - volumeStep, 0) });
            break;
          case 'increaseVolume':
            updateProperty &&
              volume != null &&
              updateProperty({ volume: Math.min(volume + volumeStep, 1) });
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
