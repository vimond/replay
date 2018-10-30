# Big, big plans

## Some goals

* Straightforward and clean React player that can replace the current reference player (in Streamlab)
* Statically typed
* Unit tests, component tests
* Full player tests with [Puppeteer](https://blog.bitsrc.io/testing-your-react-app-with-puppeteer-and-jest-c72b3dfcde59)
* Component-centric full player toolkit
* Standalone components + starter player
* Still easy to re-skin and re-configure starter player, perhaps with Storybook or Styleguidist
* Easy to integrate with Redux state, but also easy to keep out of global state
* Possibly complement traditional CSS with modern, but not an immature styling approach
* Styling framework choices should be agnostic to components
* First class user experience on touch/mobile
* Accessibility compliance...
* No company or customer specifics, or mentioning of them - prepared for OS or sharing with customers
* Pick, mix and match streaming libraries/playback technologies, but avoid bloat from covering all of them.

# Not included: The model in the broad sense

Data lookup, API integrations, commercial integrations, UI components relying on such data

# Included: The view - A player with controls

A concept of three parts:

* The player UI (including controls)
* The video streamer (see right underneath)
* The player controller, connecting the UI with the controls.

## VideoStreamer

The video streamer is the component fetching and rendering the video. It includes audio and subtitles, but no UI elements.

Different streaming components can be plugged in for different purposes.

### ✓ Premium content and modern browsers

Latest Shaka Player version for DASH playback in all modern non-Apple browsers. HTML playback for Safari. DRM support. No support for IE11 on Windows 7.

`<PremiumVideoStreamer />`

### ✓ Stream inspection for content producers

Latest Shaka Player, HLS.js, HTML support. Can perhaps consider Dash.js with smooth support.

`<MultiFormatVideoStreamer />`

### ✓ HLS and modern browsers

HLS.js and native Safari HLS support with HTML. No DRM support.

`<HlsVideoStreamer />`

### ✓ Multiple and legacy technologies

Intended for Streamlab. Shaka 1.x, Shaka 2.x with logging added, Dash.js with smooth support, Flash, Silverlight, HLS.js, HTML. DRM support.

`<LabVideoStreamer />`

### Modern wrapper

`<RxHlsVideoStreamer />`

If RxPlayer deals well with DASH streams, consider integration without video engine.

### Basic HTML video element wrapper

In the npm package, include a simple implementation covering HTML5 video, with the streamlined API. This might be open-sourced.

Create stream state change to event emitter helper, to be plugged into all pure VideoStreamer components.

Support live for HLS, but FairPlay DRM should be plugged in from a premium package. Same for TTML and SRT parsing support.

`<BasicVideoStreamer />`

### Composable VideoStreamer

Allows to specify different VideoStreamer components and mappings.

Consider callback prop invoked with possible playback technologies for the current browser. The callback should return appropriate stream for one of the possible technologies.

Premium option returning structure with both DRM and non-DRM.

### ✓ Mock streamer component

For "design mode", to be used with e.g. Styleguidist. Simulates playback state and allows manipulating it.

`<MockVideoStreamer />`

## Controls, overlays, UI containers

### General buttons and widgets

* ✓ Button
* ✓ Slider
* ✓ Drop-up selector

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

* ✓ Buffering indicator
* Player container, managing
	* ✓ User inactivity
	* ✓ Keyboard shortcuts target
	* ✓ 16:9 aspect ratio lock, fullscreen
	* Responsiveness
	* ✓ (Play state)
* ✓ Playback state monitor

The concerns above might be separated into HOCs or utilities attached to the visual container component.

### Later
	
* Markers
* Chapters
* Pause/play overlay/toggle
* Video synced graphics overlay

## Styles/skinning, some thoughts...

Decide early on plain-old CSS, SASS, or CSS in JS. 

Reason for using CSS in JS is simple embedding of default player.

Separating skin from basics and placement (not layout) is still essential.

Prepared for styling frameworks without bloat/lock-in. Consider [react-with-styles](https://github.com/airbnb/react-with-styles).

Theming support of interest? https://github.com/cssinjs/react-jss

Good old prefixing of all class names.

Styling passed directly turns off class names?

## The player controller

Consuming playback state and manipulating the playback is handled by a `<PlayerController>` and is hosting a React context.

It monitors and manipulates the playback and stream state of the video streamer, which can be placed further down in the rendered element tree.

All player controls can also be located on any level down in the element tree, and the player controller allows for all of them to connect to receive updates to the playback state, or control the playback.

# Some architecture principles

## Designing the best separation of concerns

* `<PlayerController/>` wrapper component.
	* Passing player state and API in render prop invocation.
	* Exposing API for React app outside player?
	* Configuration as part of composed player.
	* Allow for configuration overrides.

* `<PlayerUIContainer/>` UI host components
	* Helper functions
	* UI state
	* 16:9, fullscreen
	* Keyboard events, mouse events
	* Might need to manage start/end states.
	* How to bind to fullscreen button etc.? Same way as with PlayerController?

## Composing a complete player

Custom component rendering PlayerController with desired UI (see below) and desired VideoStreamer.

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
	7. ✓ User settings storage.
7. ✓ Catch up on writing missing tests.
8. ✓ Prepare revised video engine with streamlined/modernised APIs.
9. ✓ Build default player as npm package with all features.
10. ✓ Streamlab integration.
11. ✓ Review what to make configurable (overridable) in default player, e.g. strings, graphics, controls appearance, their settings.
12. ✓ Demo container app.
13. ✓ Basic HTML5 video streamer, only for MP4.
14. Guide documentation.
15. Component and API documentation [Styleguidist](https://react-styleguidist.js.org/docs/documenting.html)
16. Docs on creating a full CSS file for a customised player, including core styles.
17. Theme-based styling, preparing for next step.
18. Accessibility.
19. Touch and mobile friendly.
20. Other new pure VideoStreamers: HlsVideoStreamer, ShakaVideoStreamer.
21. NPM package(s) exposing default player and all components individually.

## Detail tasks to be done/clarified

### Preparing the project/player for other purposes than Streamlab:

* Clear and brief README.md
* External player API (exposed from PlayerController).
* ✓ For default player, a separate CSS build not including the demo app is needed.
* CSS in JS with theme + prop based customisation. Change icons, colors, sizes. Override all styles?
* Verify that Flow types are recognised in npm package consumers.
* Utilising the releases functions in Github.

### Docs and control/component gallery

#### Some goals:

* Documentation/showcasing of all controls and their props.
* Full documentation of everything else.
* Flow types must be included.
* Interactive theme editor.
* Interactive composition of a player UI.

#### [Structor](https://github.com/ipselon/structor/blob/master/docs/README.md)

* Dev environment allowing for composing components together.
* How about render props?

#### Styleguidist

* Flow support.
* Only simple dynamic code box.

#### Storybook

* Visual docs through many stories for a control. Control states correspond with stories.
* Can it also be used for the full playerUI?

#### [Documentation.js](https://github.com/documentationjs/documentation/blob/master/docs/TROUBLESHOOTING.md)

* Supports Flow.

### CSS in JS

JSS looks most interesting. HOC on each styled controls. With connected controls, double HOC-ing of many controls is needed, but not all of them. PlayerUIContainer is one special one.

Need to find strategy for player state class names. Will probably eliminate the need for playerStateClassNameBuilder, but perhaps still keep it there.

* Make the default PlayerUI optionally call injectSheet() on all controls. This should be done outside playerUI.js, so that there are no react-jss bindings.
* But don't do it on each render. Instead create a higher order function.
* ThemedReplay.js or something, wrapping the original Replay.js.
* Look into including graphics in JSS styles, or make a tight coupling.

Specific improvements and things to verify

* ✓ Test with subtitles and audio tracks...
* ✓ Make bitrateFix and bitrateCap props.
* ✓ Make sure setting different sources subsequently works. Also test that an empty source shuts down video in a clean way.
* ✓ Make sure Dash.js works in Streamlab.
* ✓ Look into setting volume, mute, and pause state on startup. Needs to be explicit start values. Full outbound API via updateProperty/onStreamPropertyChange.
* Manipulating the playback through setting props on the video streamer is asking for trouble/state out of sync. Reconsider?
* `<PlayerController />` and `<VideoStreamer />` must handle rapid reinstantiations (as happening with `react-rnd@7.4.3`).
* ✓ Live HLS support for `<BasicVideoStreamer />`.
* Improved timeline: Progress track part. Time display/preview of seek position. The latter should be a separate component.
* Respect new set of playback technologies in VideoStreamer, replacing dashImpl prop.
* ✓ Test MP4 streamer with start position.
* ✓ Let `<Volume/>` sync volume slider and mute state.

Next leap year:

* Vertical slider...
* Logging across components, if actually needed. Runtime configurable, but individual on players? https://github.com/pimterry/loglevel

