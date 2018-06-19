// @flow
import * as React from 'react';
import { defaultClassNamePrefix } from '../common';
import type { CommonProps } from '../common';
import Fullscreen from './containment-helpers/Fullscreen';
import AspectRatio from './containment-helpers/AspectRatio';
import InteractionDetector from './containment-helpers/InteractionDetector';
import KeyboardShortcuts from './containment-helpers/KeyboardShortcuts';
import type { PlaybackApi } from './VideoStreamer/types';
import getPlayerStateClassNames from './containment-helpers/playerStateClassNames';
import type { InteractionDetectorConfiguration } from './containment-helpers/InteractionDetector';
import type { KeyboardShortcutsConfiguration } from './containment-helpers/KeyboardShortcuts';

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
  videoStreamState: PlaybackApi,
  render: RenderParameters => React.Node,
  className?: string
};

const className = 'ui-container';

const classNameDefs = {
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

class PlayerUiContainer extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix,
    className: defaultClassNamePrefix.substr(0, defaultClassNamePrefix.length - 1), // Removing the last dash of the prefix. Dangerous assumption...
    aspectRatio: {
      horizontal: 16,
      vertical: 9
    }
  };

  render() {
    const { classNamePrefix, render, configuration, videoStreamState } = this.props;
    const playerClassName = this.props.className;
    return (
      <AspectRatio
        className={playerClassName}
        render={() => (
          <Fullscreen
            render={
              ({ onRef, ...fullscreenState }) => (
                <InteractionDetector
                  configuration={configuration}
                  render={({ handleMouseMove, handleTouchStart, handleTouchEnd, ...interactionState }) => {
                    const allPrefixedClassNames = getPlayerStateClassNames(
                      { ...fullscreenState, ...interactionState, ...videoStreamState },
                      classNameDefs,
                      classNamePrefix,
                      [className]
                    );
                    return (
                      <KeyboardShortcuts
                        configuration={configuration}
                        videoStreamState={videoStreamState}
                        fullscreenState={fullscreenState}
                        nudge={interactionState.nudge}
                        render={({ handleKeyUp }) => (
                          <div
                            tabIndex={1}
                            ref={onRef}
                            onMouseMove={handleMouseMove}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                            onKeyDown={handleKeyUp}
                            className={allPrefixedClassNames}>
                            {render({ fullscreenState, interactionState })}
                          </div>
                        )}
                      />
                    );
                  }}
                />
              ) // TODO: How to make this look nicer?
            }
          />
        )}
      />
    );
  }
}

export default PlayerUiContainer;

/*
What is the purpose of this component?
At least:
* Fullscreen and aspect ratio, optionally with CSS in JS. Somewhat same concern.

* Class names based on play state
* Responsiveness class names
* Keyboard shortcuts, usually responding when the container has focus
* Mouse pointer and controls hiding (class names, prop)

We want all class names and fullscreen state to be applied to the second outermost element.
This means a big, fat, ugly className prop on one div. I.e. not suitable for HOC?

Do we need a render prop approach? Yes.
Needs to expose to sub-components:
* Fullscreen toggle, state
* Responsiveness state (threshold names) for CSS in JS
* Controls hiding block. Controls hiding state (for CSS in JS)


<PlayerUiContainer render={({ isFullscreen, setFullscreen, reponsiveNames, isControlsHidden, blockHiding }) => {
  <ControlsBar/>
}} />

Another approach: Hierarchy of render props combined into one class name in a div.

<AspectRatio render={(innerClassName) => {
  <Fullscreen render={(isFullscreen, setFullscreen, fullscreenClassName) => {
    <Responsiveness render={(responsiveClassNames) => {
      <UserActivityManager render={(inactivityClassName, nudge) => {
        <StateClassNames render={(stateClassNames) => {
          <KeyboardShortcuts nudge={nudge} render={(onKeyUp) => {
            <div onKeyUp={onKeyUp} className={concat(innerClassName, inactivityClassName, responsiveClassNames, stateClassNames, fullscreenClassName)}></div>
          }}/>
        }}/>
      }}/>
    }}/>
  }}/>
}}/>
*/
/*

recompose with every component having a prop className, and applying the added version to the rendered (child) version?

const PlayerContainer = compose(aspectRatio, fullscreen, responsiveness, userActivityManager, stateClassNames, keyboardShortcuts)

Passes the following props to the component to be decorated, which is the inner div:

* className (collected/extended by most HOCs)
* some style properties for CSS in JS
* isFullscreen
* setFullscreen
* handleKeyUp
* handleMouseMove
* handleTouchStart
* handleTouchEnd
* nudge





KeyboardShortcuts
-----------------
from above:
* configuration
* nudge callback
* updateProperty/gotoLive/setPosition
* videoStreamState
* isFullscreen for Esc key workaround

send down:
* handleKeyUp (to be applied to inner div)

StateClassNames
---------------
from above:
* videoStreamState

send down:
* stateClassNames

UserActivityManager
-------------------
from above:
* configuration (timeout)

send down:
* handleMouseMove
* handleTouchStart
* handleTouchEnd
* activityClassName
* nudge

Responsiveness
--------------
from above:
* configuration

render:
* resize detection divs

send down:
* responsivenessClassNames

Fullscreen/Aspect ratio
-----------------------
We need a DOM ref for fullscreen methods. Ideally it should be the inner div.





*/
