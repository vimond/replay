
# Big, big plans

## Naming idea

*v-player* for full player and *v-stream* for video engine?

```<Vstream/> <VStream/> <vStream/>```

```<Vplayer/> <VPlayer/> <vPlayer/>```

Sheesh.

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
* Also intended as replacement for player used in of Streamlab
* Code splitting for the integrated streaming libraries
* Prepare for commercial integrations. Consider creating a Google IMA SDK integration, but nothing else.
* Prettier.

# The view: Player with controls

## Video view

### Premium video engine

Initially the full Vimond video engine. However, modernise and streamline API and config in v3 of the React component.

Best naming suggestion yet: `<VideoStreamer/>`

### Simple HTML5 video wrapper

Later, create a simple replacement covering HTML5 video, with the streamlined API. This might be open-sourced.

### Mock streamer component

For "design mode", to be used with e.g. Styleguidist.

## Controls, overlays, UI containers

### General buttons and widgets

* ✓ Button
* ✓ Slider
* Overlay
* ✓ Drop-up selector
* Toast
* Poster

### Specialised controls

* ✓ Play/pause
* ✓ Timeline with scrubber
* ✓ Volume with mute toggle
* ✓ Subtitles
* ✓ Audio
* ✓ Fullscreen
* ✓ Time display
* ✓ Live button
* ✓ Skip back/forth X seconds
* ✓ Quality selector
	
### Other UI components

* Poster? Need to decide on lifecycle strategy.			
* ✓ Buffering indicator
* Player container, managing
	* User inactivity
	* Keyboard shortcuts target
	* 16:9 aspect ratio lock, fullscreen
	* Responsiveness
	* (Play state)

The concerns above might be separated into HOCs or utilities attached to the visual container component.

### Later
	
* Markers
* Chapters
* Episodes selector
* Share
* Pause/play overlay/toggle
* Video synced graphics overlay
* Multiplayer...
* End poster with replay and suggestions

## Styles/skinning, some thoughts...

Decide early on plain-old CSS, SASS, or CSS in JS. 

Reason for using CSS in JS is simple embedding of default player.

Separating skin from basics and placement (not layout) is still essential.

Prepared for styling frameworks without bloat/lock-in. Consider [react-with-styles](https://github.com/airbnb/react-with-styles).

Theming support of interest? https://github.com/cssinjs/react-jss

Good old prefixing of all class names. Consider passing down implicitly, but is it PlayerController's responsibility? Or another HOC?

Styling passed directly turns off class names?

Open source icon set. Best practices for SVG icons.

# [Playback] state management

Consuming playback state and manipulating the playback is handled by a `<PlayerController>` dealing specially with the video stream component.

Later: Look into Flux action set prepared for Redux. Both buttons and video state changes.

# Architecture

## Designing the best separation of concerns

* `<PlayerController/>` wrapper component.
	* Passing player state and API in render prop invocation.
	* Exposing API for React app outside player?
	* Configuration as part of composed player.
	* Allow for configuration overrides.

* `<PlayerUiContainer/>` UI host element
	* Helper functions
	* UI state
	* 16:9, fullscreen
	* Keyboard events, mouse events
	* Might need to manage start/end states.
	* How to bind to fullscreen button etc.? Same way as with PlayerController?

## Composing a complete player

Custom component rendering PlayerController with desired UI (see below) and desired VideoStreamer.

Magical injections scoped to instance of player component:

* Applying class name prefix (reconsider)
* Injecting logging. Context API?

### Straightforward JSX UI. No magic:

* Composing the UI with deep children structure.
* Passing strings
* Passing graphics
* Specifying CSS. Some theme or CSS in JS approaches could be needed
* Deep application of CSS in JS solutions

# Top level plan

1. ✓ Write general typed components with tests.
2. ✓ Write typed player components with tests.
3. ✓ Compose a player UI.
4. ✓ Find open source graphic assets.
5. ✓ Write CSS.
6. Player UI container features as composable HOCs.
7. Catch up on writing missing tests.
8. Prepare revised video engine with streamlined/modernised APIs.
9. Build starter player with all features.
10. Demo container app.
11. Component and API documentation [Styleguidist](https://react-styleguidist.js.org/docs/documenting.html)
12. NPM package exposing default players and all parts. 
13. Redux actions (with player instance addressing).
14. Redux demo app.

## Detail tasks to be done/clarified

* OK: Move the types for the playback consumption API into a common file.
* OK: Complete typing the source and text tracks.
* Rename VideoStream to VideoStreamer.
* Improved timeline: Progress track part. Time display/preview of seek position.
* Make sure setting different sources subsequently works.
* Do we need a stop method?
* Make instant mode for slider, so that volume can be updated immediately.
* Vertical slider...
* Test that player UI doesn't reload video...
* Remove enterFullscreen/exitFullscreen as callback props.
* Revise rendering and improve performance.
* Decide on how to pass technology.
* Need to set all state and prop properties on startup? (onReady?) PlayerController is probably better for this than VideoStreamer.
* External player API (exposed from PlayerController).
* Logging across components. Runtime configurable, but individual on players? https://github.com/pimterry/loglevel
* Create type set for configuration structure.
