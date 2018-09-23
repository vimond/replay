// @flow
import * as React from 'react';
import { defaultClassNamePrefix } from '../../common';
import type { CommonProps } from '../../common';
import Fullscreen from '../containment-helpers/Fullscreen';
import AspectRatio from '../containment-helpers/AspectRatio';
import InteractionDetector from '../containment-helpers/InteractionDetector';
import KeyboardShortcuts from '../containment-helpers/KeyboardShortcuts';
import type { InteractionDetectorConfiguration } from '../containment-helpers/InteractionDetector';
import type { KeyboardShortcutsConfiguration } from '../containment-helpers/KeyboardShortcuts';
import PlayerStateClassNames from '../containment-helpers/PlayerStateClassNames';

type RenderParameters = {
  fullscreenState: {
    isFullscreen: boolean,
    updateProperty: ({ isFullscreen: boolean }) => void,
    enterFullscreen: () => void,
    exitFullscreen: () => void
  },
  interactionState: {
    nudge: () => void,
    isUserActive: boolean
  }
};

type Props = CommonProps & {
  aspectRatio: {
    horizontal: number,
    vertical: number
  },
  configuration?: {
    interactionDetector?: InteractionDetectorConfiguration,
    keyboardShortcuts?: KeyboardShortcutsConfiguration
  },
  render: RenderParameters => React.Node,
  className?: string
};

const className = 'ui-container';

const classNameDefinitions = {
  responsivenessPrefix: 'player-size-',
  volumePrefix: 'volume-level-',
  isFullscreen: 'is-fullscreen',
  isUserActive: 'is-user-active',
  isUserInactive: 'is-user-inactive',
  isBuffering: 'is-buffering',
  isSeeking: 'is-seeking',
  isPlaying: 'is-playing',
  isPaused: 'is-paused',
  isStarting: 'is-starting',
  isMuted: 'is-muted',
  isAtLivePosition: 'is-at-live-position',
  isLive: 'is-live',
  isOnDemand: 'is-on-demand',
  isDvrEnabled: 'is-dvr-enabled',
  isFailed: 'is-failed'
};

// Make stateClassNames pass an array with all relevant keys, so that a simple mapping can be done.
// In addition comes dynamically generated class names from responsiveness, and perhaps volume level.

const noConnect = Component => Component;

export const getConnectedPlayerUIContainer = (connector: any => React.ComponentType<any> = noConnect) => {
  const ConnectedPlayerStateClassNames = connector(PlayerStateClassNames);
  const ConnectedKeyboardShortcuts = connector(KeyboardShortcuts);

  return class PlayerUIContainer extends React.Component<Props> {
    static defaultProps = {
      classNamePrefix: defaultClassNamePrefix,
      className: defaultClassNamePrefix.substr(0, defaultClassNamePrefix.length - 1), // Removing the last dash of the prefix. Dangerous assumption...
      aspectRatio: {
        horizontal: 16,
        vertical: 9
      }
    };

    render() {
      const { classNamePrefix, render, configuration, aspectRatio } = this.props;
      const playerClassName = this.props.className;
      return (
        <AspectRatio
          className={playerClassName}
          aspectRatio={aspectRatio}
          render={() => (
            <Fullscreen
              render={({ onRef, ...fullscreenState }) => (
                <InteractionDetector
                  configuration={configuration}
                  render={({ handleMouseMove, handleTouchStart, handleTouchEnd, handleFocus, ...interactionState }) => (
                    <ConnectedKeyboardShortcuts
                      configuration={configuration}
                      fullscreenState={fullscreenState}
                      nudge={interactionState.nudge}
                      toggleFixedUserActive={interactionState.toggleFixedUserActive}
                      render={({ handleKeyDown }) => (
                        <ConnectedPlayerStateClassNames
                          {...fullscreenState}
                          {...interactionState}
                          classNameDefinitions={classNameDefinitions}
                          className={className}
                          classNamePrefix={classNamePrefix}>
                          <div
                            tabIndex={0}
                            ref={onRef}
                            onMouseMove={handleMouseMove}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                            onKeyDown={handleKeyDown}
                            onFocus={handleFocus}>
                            {render({ fullscreenState, interactionState })}
                          </div>
                        </ConnectedPlayerStateClassNames>
                      )}
                    />
                  )}
                />
              )}
            />
          )}
        />
      );
    }
  };
};

const PlayerUIContainer = getConnectedPlayerUIContainer();
export default PlayerUIContainer;
