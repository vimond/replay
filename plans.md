
# Big, big plans

## Naming idea

*v-player* for full player and *v-stream* for video engine.

## Some goals

* Statically typed
* Tests, both for components and full player
* Component-centric full player toolkit
* Standalone components + starter player
* Still easy to re-skin and re-configure starter player
* Easy to integrate with Redux state, but also easy to keep out of global state
* Possibly complement traditional CSS with modern, but not an immature styling approach
* Styling framework choices should be agnostic to components
* First class user experience on touch/mobile
* Accessibility compliance...
* No company or customer specifics, or mentioning of them - prepared for OS or sharing with customers
* Code splitting for the integrated streaming libraries

# The view: Player with controls

## Video view

### Premium video engine

Initially the full Vimond video engine. However, modernise and streamline API and config.

### Simple HTML5 video wrapper

Later, create a simple replacement covering HTML5 video, with the streamlined API. This might be open-sourced.

## Controls, overlays, UI containers

### General buttons and widgets

* Button
* Slider
* Overlay
* Drop-up selector
* Toast
* Poster

### Specialised controls

* Play/pause
* Timeline with scrubber
* Volume with mute toggle
* Subtitles
* Audio
* Fullscreen
* Time display
* Live button
	
### Other UI components
			
* Loading indicator
* Player container, managing
	* User inactivity
	* Keyboard shortcuts target
	* 16:9 aspect ratio lock, fullscreen
	* Responsiveness
	* (Play state)

The concerns above might be separated into HOCs or utilities attached to the visual container component.

### Later
	
* Skip back/forth X seconds
* Quality selector
* Markers
* Chapters
* Episodes selector
* Share
* Pause/play overlay/toggle
* Video synced graphics overlay
* Multiplayer...
* End poster with replay and suggestions

## Styles/skinning

Decide early on plain-old CSS, SASS, or CSS in JS.

Separating skin from basics and placement (not layout) is still essential.

Prepared for styling frameworks without bloat/lock-in. Consider [react-with-styles](https://github.com/airbnb/react-with-styles).

Theming support of interest? https://github.com/cssinjs/react-jss

Good old prefixing of all class names. Use React context API to pass down prefix!

Styling passed directly turns off class names?

Best practices for SVG icons.

Open source icon set.

# [Playback] state management

Let all components easily observe playback state, without actions + Redux store.

Let all components easily manipulate playback state. Expose "actions" object to them.

Look into Flux action set.

# APIs

## Key APIs of a video player

### Starting up

* Configuration
* What to play (URLs, extra stream data, start position)

### State to be observed/consumed

* Playback position (also as timestamp)
* Video duration
* Is live stream (or on demand)
* Live mode
* Volume
* Is muted
* Is buffering
* Is seeking
* Is paused (or playing)
* Is unstarted
* Is completed
* Stream bitrates
* Currently selected bitrate
* Available subtitles
* Available audio tracks
* Buffer ahead size
* Playback error

### Playback state to be manipulated

* Is paused
* Volume
* Is muted
* Cap bitrate
* Lock bitrate
* Add, remove, replace subtitle tracks

### Operations on the playback state

* Seek
* Go to live
* Stop

## Commercial features preparations

Tracking hooks. Handling schedules with pre, mid, and post rolls, without messing up flow and UI.

Google IMA integration.

# Top level plan

1. Write general typed components with tests.
2. Write typed player components with tests.
3. Compose a player UI.
4. Find open source graphic assets.
5. Write CSS.
6. Prepare revised video engine with streamlined/modernised APIs.
7. Connect video engine with player UI. Is the context API useful for this?
8. Build starter player with all features.
9. Demo container app.
10. Redux actions (with player instance addressing).
11. Redux demo app.
12. Component and API documentation [Styleguidist](https://react-styleguidist.js.org/docs/documenting.html)

## Designing the best separation of concerns

What to abstract with magic, and what to make clear APIs for? 

### Current mix

* Wrapper component.
	* Passing player state and API to all children.
	* Exposing API for React app outside player.
	* Configuration as part of composed player.
	* Allow for configuration overrides.

* Containment/UI host element
	* Helper functions
	* UI state
	* Keyboard events, mouse events
	* Might need to manage start/end states.

Magical injections scoped to instance of player component:

* Applying class name prefix
* Injecting logging

Straightforward JSX UI. No magic:

* Composing the UI with deep children structure.
* Passing strings
* Passing graphics
* Specifying CSS. SOme theme or CSS in JS approaches could need 
* Deep application of CSS in JS solutions

### Passing player state

Easiest approach: Pass all in ...props or ...state in PlayerUI. Probably container component applying everything.

But too magical? Confusing? Perhaps examples are better.

All props from outside wrapped should be possible to set on PlayerUI, to be used in children.

OR: Let the user select one of these approaches:

a) HOC managing the video stream state: 

* `<Comp {...this.state} label="My comp" />`
* `<Comp isPaused={this.state.isPaused} label="My comp" />`

b) Wrapper component using React.cloneElement()

* `<Comp isPlaybackConsumer/>`
* completely implicit...

c) Wrapper component with render prop. Specify player UI and everything in one place...

But how do we render at appropriate times, without performance issues?

Have a look at React players out there and observe rerendering during playback.

* `render({ isPaused, playState, playMode, volume, ... }, configuration, source, props) => (<PlayerHost videoStreamState={videoStreamState}><Comp isPaused={videoStreamState.isPaused}/><BasicVideoStream source={source}/></PlayerHost>);`

The two last ones should be based on children traversal. All of them need consumers to be directly exposed in the children structure.

Should not include strings, graphics. Should include logging and class name prefix.

Consider namespacing - videoStream.volume. How does that affect rendering, though? Probably need full object to be reinstantiated on property changes, and not when prop changes.

### How to specify the video stream component?

Some alternatives:

* Instance from outside the composed player. E.g. <MyPlayer><BasicVideoStream source={{}} /></MyPlayer>
* As part of the composition (wrapper parameter specifying the component). Expose as prop.
* As part of the player UI (with children traversal).

The first option can create conflicts on setting callbacks, e.g. onStreamStateChange. A secret, parallel API can be considered. 

The last option is most intuitive in player composition. In render prop strategy, callbacks are needed.

Should playback state consumption be allowed directly from the outside? Or do we need to have a middle API?

## Detail tasks to be done

* OK: Move the types for the playback consumption API into a common file.
* OK: Complete typing the source and text tracks.
* Make sure setting different sources subsequently works.
* Test that player UI doesn't reload video...
* Decide on how to pass technology.
* External player API (exposed from ControllablePlayer).
* Better name for ControllablePlayer.
* Class name prefix must be managed on the non-generic level.
* Logging across components. Runtime configurable, and individual on players? Both videoStreamProps and videoStreamState needs to pass for magic.
* Type for configuration structure.