# Big, big plans

## Some goals

* Straightforward and clean React player that can replace the current reference player (in Streamlab)
* Statically typed
* Tests, both for components and full player
* Prettier
* Component-centric full player toolkit
* Standalone components + starter player
* Still easy to re-skin and re-configure starter player, perhaps with Storybook or Styleguidist
* Easy to integrate with Redux state, but also easy to keep out of global state
* Possibly complement traditional CSS with modern, but not an immature styling approach
* Styling framework choices should be agnostic to components
* First class user experience on touch/mobile
* Accessibility compliance...
* No company or customer specifics, or mentioning of them - prepared for OS or sharing with customers
* Code splitting for the integrated streaming libraries
* Perhaps prepare for commercial integrations. Consider creating a Google IMA SDK integration, but nothing else.

## Naming ideas

*v-player* for full player and *v-stream* for video engine?

```<Vstream/> <VStream/> <vStream/>```

```<Vplayer/> <VPlayer/> <vPlayer/>```

No, forget about it, that's too ugly.

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
* Poster?

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
	* ✓ User inactivity
	* ✓ Keyboard shortcuts target
	* ✓ 16:9 aspect ratio lock, fullscreen
	* Responsiveness
	* ✓ (Play state)

The concerns above might be separated into HOCs or utilities attached to the visual container component.

### Later
	
* Markers
* Chapters
* Pause/play overlay/toggle
* Video synced graphics overlay

In someone's dreams:

* Episodes selector
* Share
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
	1. ✓ Aspect Ratio
	2. ✓ Fullscreen
	3. ✓ User activity
	4. ✓ Keyboard shortcuts
	5. ✓ State class names 
	6. Player size responsiveness. ResizeObserver in Chrome. https://codeburst.io/media-queries-based-on-element-width-with-mutationobserver-cf2eff172787 elsewhere.
	7. User settings storage.
7. Catch up on writing missing tests.
8. Prepare revised video engine with streamlined/modernised APIs.
9. Build default player as npm package with all features.
10. Streamlab integration.
11. Review what to make configurable (overridable) in default player, e.g. strings, graphics, controls appearance, their settings.
12. Demo container app.
13. Theme-based styling, preparing for next step.
14. Simple HTML5 video streamer, only for MP4.
15. Component and API documentation [Styleguidist](https://react-styleguidist.js.org/docs/documenting.html)
16. Docs on creating a full CSS file for a customised player, including core styles.
17. NPM package(s) exposing default player and all components individually.
18. Redux actions (with player instance addressing).
19. Redux demo app.

## Detail tasks to be done/clarified

* OK: Move the types for the playback consumption API into a common file.
* OK: Complete typing the source and text tracks.
* OK Rename VideoStream to VideoStreamer.
* OK Create type set for configuration structure. Include all individual component configs.
* OK Quality selector. Reconsider icon.
* OK Decide on how to pass technology.

Before settling the architecture:

After video engine is plugged in:

* OK Test that player UI doesn't reload video...
* OK Hide controls bar!
* Verify buffering state with playback monitor.
* Fix currentBitrate and publish new videoengine.
* Improved timeline: Progress track part. Time display/preview of seek position. The latter should be a separate component.
* Timeline: Don't call setPosition on drag start. Maybe block glitch with isSeeking.
* Make sure setting different sources subsequently works. Also test that an empty source shuts down video in a clean way.
* Need to set all state and prop properties on startup? (onReady?) PlayerController is probably better for this than VideoStreamer.

* Test with subtitles and audio tracks...

Before settling the architecture: Revise rendering and improve performance. Probably drop render prop.

* PureComponent?
* shouldComponentUpdate only checking the relevant props?
* Compare prod build of player with other real-world example in performance tab of DevTools.
* Still, the flash of element updates look bad in comparison.
* Look into automatic detection of subscribeToStreamStateUpdates() (along with updateProperty) in spread props instead.
* Or consider the manipulation API (subscribe/update methods) to be one object that doesn't change, and pass it down in the render prop. I.e. individual state property updates can be a matter isolated within each component.
* Do we then need PlayerController? Yes, if it makes it clearer for the developers customising it!
* We should also allow for non-magical state update subscription, maybe with wrapper component?

Streamlab integration

* All DASH alternatives. Simply add libraries as props on the component, or create a `withPlaybackLibraries()` "HOC".
* NPM package.

Preparing the project/player for other purposes:

* External player API (exposed from PlayerController).
* For default player, a separate CSS build not including the demo app is needed.
* CSS in JS with theme + prop based customisation. Change icons, colors, sizes. Override all styles?
* Documentation.

Next leap year:

* Vertical slider...
* Exit button for Streamlab? Perhaps a simple overlay injection.
* Logging across components, if actually needed. Runtime configurable, but individual on players? https://github.com/pimterry/loglevel

