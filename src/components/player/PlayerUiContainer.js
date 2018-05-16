// @flow
import * as React from 'react';
import { defaultClassNamePrefix, prefixClassNames } from '../common';
import type { CommonProps } from '../common';

type AspectRatioProps = CommonProps & {
  aspectRatio: {
    horizontal: number,
    vertical: number
  },
  children: React.Node,
  outerClassName?: string,
  innerClassName?: string
};

type Props = CommonProps & {
  aspectRatio: {
    horizontal: number,
    vertical: number
  },
  children: React.Node,
  className?: string
};

const AspectRatio = ({ aspectRatio: { horizontal = 16, vertical = 9 }, children, outerClassName, innerClassName } : AspectRatioProps) => {
  const outerStyle = {
      position: 'relative'
    },
    beforeStyle = {
      display: 'block',
      width: '100%',
      paddingTop: (vertical * 100 / horizontal).toFixed(2) + '%'
    },
    innerStyle = {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0'
    };
  return (
    <div className={outerClassName} style={outerStyle}>
      <div style={beforeStyle}/>
      <div className={innerClassName} style={innerStyle}>
        {children}
      </div>
    </div>
  );
};

const uiClassName = 'ui-container';

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
    const {
      className,
      classNamePrefix
    } = this.props;
    return <AspectRatio innerClassName={prefixClassNames(classNamePrefix, uiClassName)} outerClassName={className} {...this.props}/>
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