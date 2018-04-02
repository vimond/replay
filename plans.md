
# Big, big plans

## Some goals

* Statically typed
* Tests, also for components
* Component-centric full player toolkit
* Standalone components + starter player
* Still easy to re-skin starter player
* Easy to integrate with Redux state, but also easy to keep out of global state
* Possibly complement traditional CSS with modern, but not an immature styling approach
* Styling framework choices should be agnostic to components
* Accessibility compliance...
* No company or customer specifics, or mentioning of them - prepared for different VCS access policies
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

Theming support of interest? https://github.com/cssinjs/react-jss

Good old prefixing of all class names?

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