// @flow
import * as React from 'react';
import type { PlayMode } from '../VideoStreamer/types';
import type { FullscreenState } from './Fullscreen';
import type { InspectMethod } from '../PlayerController/ControllerContext';

type RenderParameters = {
  handleKeyDown: KeyboardEvent => void
};

type KeyMapping = string | Array<string>;

export type KeyboardShortcutsConfiguration = {
  keyMap: {
    togglePause?: KeyMapping,
    toggleMute?: KeyMapping,
    toggleFullscreen?: KeyMapping,
    skipBack?: KeyMapping,
    skipForward?: KeyMapping,
    increaseVolume?: KeyMapping,
    decreaseVolume?: KeyMapping
  },
  volumeStep?: number,
  skipOffset?: number
};

type UpdateableProperties = { volume: number } | { isMuted: boolean } | { isPaused: boolean };

type Props = {
  nudge?: () => void,
  toggleFixedUserActive?: () => void,
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

const matchKeyCaseSafely = (key: ?(string | any), eventKey: string): boolean => {
  return typeof key !== 'string'
    ? false
    : key.length > 1
      ? key === eventKey
      : key.toLowerCase() === eventKey.toLowerCase();
};

const getMatchingOperationFromKeyMap = (config: KeyboardShortcutsConfiguration, eventKey: string): ?string => {
  if (config.keyMap) {
    return Object.entries(config.keyMap)
      .filter(
        ([_, mappedKeys]) =>
          !!(
            matchKeyCaseSafely(mappedKeys, eventKey) ||
            (Array.isArray(mappedKeys) && mappedKeys.filter(key => matchKeyCaseSafely(key, eventKey)).length)
          )
      )
      .map(entry => entry[0])[0];
  }
};

class KeyboardShortcuts extends React.Component<Props> {
  handleKeyDown = (keyboardEvent: KeyboardEvent) => {
    let {
      nudge,
      toggleFixedUserActive,
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
      const operation = getMatchingOperationFromKeyMap(configuration.keyboardShortcuts, keyboardEvent.key);
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
            updateProperty && volume != null && updateProperty({ volume: Math.max(volume - volumeStep, 0) });
            break;
          case 'increaseVolume':
            updateProperty && volume != null && updateProperty({ volume: Math.min(volume + volumeStep, 1) });
            break;
          case 'toggleUserActive':
            if (toggleFixedUserActive) {
              toggleFixedUserActive();
            }
            break;
          default:
          // eslint requires default in switch. Can't see that this is a good case for such a requirement.
        }
        if (nudge && operation !== 'toggleUserActive') {
          nudge();
        }
        keyboardEvent.preventDefault();
      } else if (keyboardEvent.key === 'Tab' && nudge) {
        nudge();
      }
    }
  };

  render() {
    const { handleKeyDown } = this;
    return this.props.render({ handleKeyDown });
  }
}
export default KeyboardShortcuts;
