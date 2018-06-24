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
* Code splitting for the integrated streaming libraries
* Perhaps prepare for commercial integrations. Consider creating a Google IMA SDK integration, but nothing else.

## Naming ideas

Avoid fancy names, but it needs to stand out for some practical reasons.

### Replay

Short for _React player_.

npm: `vimond-replay` since `replay` is taken. Full player component: `<Replay />`.

### re-play

Less misunderstandings and currently available as npm package name. However, bad style using unnecessary characters.

### react-player-kit

A bit long. And should we avoid using React as part of the name?

### replayed

Hmmmm.

### Discarded ideas:

*v-player* for full player and *v-stream* for video engine?

```<Vstream/> <VStream/> <vStream/>```

```<Vplayer/> <VPlayer/> <vPlayer/>```

That's just too ugly.

# The view: Player with controls

## VideoStreamer

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

`<BasicVideoStreamer />`

### ✓ Mock streamer component

For "design mode", to be used with e.g. Styleguidist. Simulates playback state and allows manipulating it.

`<MockVideoStreamer />`

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
* ✓ Playback state monitor

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

Good old prefixing of all class names.

Styling passed directly turns off class names?

# [Playback] state management

Consuming playback state and manipulating the playback is handled by a `<PlayerController>` dealing specially with the video stream component.

# Architecture

## Designing the best separation of concerns

* `<PlayerController/>` wrapper component.
	* Passing player state and API in render prop invocation.
	* Exposing API for React app outside player?
	* Configuration as part of composed player.
	* Allow for configuration overrides.

* `<PlayerUIContainer/>` UI host element
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
	7. User settings storage.
7. ✓ Catch up on writing missing tests.
8. ✓ Prepare revised video engine with streamlined/modernised APIs.
9. ✓ Build default player as npm package with all features.
10. ✓ Streamlab integration.
11. Review what to make configurable (overridable) in default player, e.g. strings, graphics, controls appearance, their settings.
12. Demo container app.
13. Theme-based styling, preparing for next step.
14. Basic HTML5 video streamer, only for MP4.
15. Component and API documentation [Styleguidist](https://react-styleguidist.js.org/docs/documenting.html)
16. Docs on creating a full CSS file for a customised player, including core styles.
17. RxHlsVideoStreamer.
18. NPM package(s) exposing default player and all components individually.

## Detail tasks to be done/clarified

Preparing the project/player for other purposes:

* Clear and brief README.md
* External player API (exposed from PlayerController).
* ✓ For default player, a separate CSS build not including the demo app is needed.
* CSS in JS with theme + prop based customisation. Change icons, colors, sizes. Override all styles?
* Verify that Flow types are recognised in npm package consumers.
* Documentation.

General improvements and things to verify

* Silverlight doesn't work. Is this some re-rendering issue?
* Test with subtitles and audio tracks...
* Make lockedBitrate and maxBitrate props.
* Look into setting volume, mute, and pause state on startup.
* Make sure setting different sources subsequently works. Also test that an empty source shuts down video in a clean way.
* Improved timeline: Progress track part. Time display/preview of seek position. The latter should be a separate component.
* Respect new set of playback technologies in VideoStreamer, replacing dashImpl prop.
* Block <VideoStreamer /> from invoking onStreamStateChange after unmount.

Next leap year:

* Vertical slider...
* Exit button for Streamlab? Perhaps a simple overlay injection.
* Logging across components, if actually needed. Runtime configurable, but individual on players? https://github.com/pimterry/loglevel

