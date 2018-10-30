# Technical topics 

For developers contributing to this project, or extending or consuming the player or components library.

## package.json/yarn commands

[Yarn](https://yarnpkg.com/) is used instead of `npm`. The workflows are not tested with `npm`.

Run `yarn install` before continuing with the commands below.

#### Start dev server with demo app for development

The default port is set to be `3033`.

```sh
yarn start
```

#### Run Flow type checks

```sh
yarn flow
```

#### Run tests

```sh
yarn test
```

#### Build component library, prepared for production/npm publish

```sh
yarn build-lib
```

#### Start x0 docs server for writing or displaying live component code examples

```sh
yarn docs
```

#### Build x0 static docs with live component code examples

_NOTE: Doesn't work yet._

```sh
yarn build-docs
```

#### Library build subtasks

These are run as part of the `yarn build-lib` command:

```sh
build-es5
build-flow
build-css
```

#### Create-React-App legacy commands

These have no purpose for this project.

```sh
yarn build
yarn eject
```

## Using Flow types

Component prop types are specified with Flow. And quite importantly, the video streamer API is defined with Flow types. These types are essential to understanding how controls should operate on the video playback, and for creating different VideoStreamer components wrapping different playback technologies.

However, Flow is not perfect, and there are examples of `// $FlowFixMe` in the code. It cannot be guaranteed that all typing is protecting against incorrect API usage.

All code being part of the exposed library should be annotated with Flow types, with the `// @flow` "directive" at the start of the file.

The npm package is set up so that consumers automatically will have the Flow types of Replay, components, and other exposed parts, available.

## Styling and class name principles

This chapter describes the approach to class naming and style rules.

### Prefixed class names

All controls and container components have prefixed class names. The default prefix is `replay-`, and a full class name will then for instance be `replay-play-pause-button`. The prefix can be changed when creating custom players. In this way, the player can get different skins coexisting in the same CSS scope. I.e. a common site-wide CSS bundle can contain different skins for Replay players branded differently according to e.g. content category.

### Not [BEM](http://getbem.com/naming/), but...

Controls typically have several class names: One corresponding to the control's name and purpose, and one for the generic component(s) used in the control, and maybe one or more for the state of the control. For instance the PlayPauseButton's root element gets the following class attribute with the default prefix: 

```html
<div class="replay-play-pause-button replay-toggle-button replay-toggled-off">...</div>
```

### DRY and common-rule oriented stylesheets

The CSS is organised with as few rules as possibly applying to many distinct components or controls, and with modifier rules based on class names set further up in the DOM hierarchy. This is the traditional approach, contrary to an "object-oriented" stylesheet, where CSS rules are tightly coupled to components and possibly repeated several times.

The intended outcome is to be DRY, in the sense that common styles and properties are only defined once, and some exceptions are simply overriding what's common through more targeted selectors.

In practice:

* Some style rules apply to multiple controls. I.e. all control buttons share a lot of styling through common class names.
* The container element for the full UI sets a lot of class names based on the player state. This can be, and is used to create style rules with descendant selector.

### CSS module organisation

For reference, in the Replay code base, the default stylesheet is built with several CSS files with the following setup. However, replacement stylesheets can be organised independently of the default one.
* Some distinct, but general CSS files when there is a requirement for styles specifically for a component/control. These are located in the `components/` hierarchy and contain no skin or layout styles.
* Style rules for the default skin, organised in different files, located in `default-player/default-skin/`: `sizesAndLayout.css`, `colors.css`, `animations.css`, and assembled with some more styles in `index.css`.
* `replay-default.css` includes all above and constitutes the full default stylesheet.

## Specifying what to play, i.e. the video source

The VideoStreamer prop `source` can be a string containing the video or stream URL in the basic cases. When instead passing an object with at least a `streamUrl` string property, several other technical details can optionally be specified at the same time:

* Side-loaded subtitles.
* A position to start playback from, offset from the start of the video.
* DRM information for premium streams.
* Playback technology for the stream specified in the `streamUrl` property. This is relevant for other VideoStreamer implementations covering more than technology.

The VideoStreamer closes down any current playback and starts a new one if the source object changes. In other words, *referential inequality* for the `source` object will also change the playback. 

If changing only the `streamUrl` property of the existing object passed to the video streamer `source` prop, this will not be detected as a changed source in the video streamer.

Specify a nullish `source` prop, in order to shut down playback, or not start a playback when the video streamer or Replay player is inserted.

The following example indicates several different properties that more or less could be passed in the `source` object in advanced or more specific playback use cases.

```javascript
const source = {
  playbackTechnology: 'dash',
  streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mpd',
  licenseUrl: 'https://license.example.com/BigBuckBunny/drmLicense',
  licenseRequestDetails: {
    widevineServiceCertificateUrl: 'https://license.example.com/drmCertificate'
  },
  startPosition: 313,
  textTracks: [{
    src: 'https://example.com/example-media/en.vtt',
    kind: 'subtitles',
    language: 'en',
    label: 'English',
    contentType: 'text/vtt'
  }, {
    src: 'https://example.com/sexample-media/no.vtt',
    kind: 'subtitles',
    language: 'no',
    label: 'Norwegian',
    contentType: 'text/vtt'
  }]
};
```

## How to control or observe all aspects of playback

The controls inserted to the built-in Replay player UI are already [connected](architecture-patterns.md#Connecting_the-_controls).

For custom controls or UI components consuming the video playback state, use `connectControl()` (TODO: source link) in order to expose the video streamer API as props to the custom component. This function takes a "dumb" component, and possibly a list of video streamer state properties to observe for changes and pass down to the component. It returns a higher-order component. The list of properties to observe and pass down can be specified as an array of strings in the component's static field `streamStateKeysForObservation`.

It also passes down a couple of methods as props to the component:

* `setProperty()`: Use this for setting/updating video streamer props, changing position, volume, current text track, pause, etc.
* `inspect()`: This returns all state properties of the video streamer and their latest value. It is useful when initialising a component after playback starts, or when observation and frequently updates of specific props are not necessary.

More info:

* TODO: connectControl() API reference link.
* [Example of connecting a custom control](customize.md#Customising_the_player_UI_component_tree).

In the following chapters, video streamer state properties and playback manipulation APIs are listed by topic. Note that there are only a handful properties to be set, and there is no symmetry between state properties and settable props, not even in naming.

TODO: Link to API reference for all API members below.

### Positions, clock times, durations, DVR

Current playback `position` and `duration` of the stream or video file are exposed in properties with these two names. Both for live DVR streams and on demand streams, the range limitation `0 ≤ position ≤ duration` applies. The position can be changed within the same range with `setProperty({ position: newPosition })`, and again both with live DVR and on demand streams.

For live streams, duration constitutes the DVR seekable range, and can change during playback. When playing at the live edge, `position ≈ duration`.

Note that for live streams with a sliding DVR window, the position might remain constant even if playback progresses. For this, live streams also expose clock time for the current stream position, through `absolutePosition`. Use this for indicating actual playback progress, since position might be unchanging when the offset or seekable range is not changing.

* State properties: `position: number`, `duration: number`, `absolutePosition: Date`, `absoluteStartPosition: Date`.
* Playback manipulation: `setProperty({ position: number })`, `setProperty({ isAtLivePosition: true })`.

### Play state as phases of a video playback

An "enum" or set of different strings are exposed in the `playState: PlayState` property, with values like `'inactive'`, `'playing'`, `'buffering'`, etc. This is a one-dimensional way of expressing the playback state, and doesn't address that a stream can be both `'paused'` and `'buffering'`, for instance.

### Is the stream paused, is it buffering, is a seeking operation going on?

When `playState` is only indicating one of possibly two or three concurrent states, the following boolean state properties are updated independently, and more than one can be `true` at a time:

* State properties: `isBuffering: boolean`, `isSeeking: boolean`, `isPaused: boolean`.
* Playback manipulation: `setProperty({ isPaused: boolean })`

### Stream mode: On demand, live. Timeshifting availability

The state property `playMode: PlayMode` can contain three string values, `'ondemand'`, `'livedvr'`, `'live'`. The latter indicates a live stream which is not seekable.  `'livedvr'` indicates a live stream which can be timeshifted, i.e. allows for seeking. On demand streams can always be seeked.

`isAtLivePosition: boolean` is set to false when a live playback is timeshifted. Use `setProperty({ isAtLivePosition: true })` in order to change this property into true`.

### Current bitrate and available qualities for a stream

Does not apply to `<BasicVideoStreamer/>`, due to missing capabilities of the `HTMLVideoElement`. It is however relevant for adaptive streaming player libraries wrapped as video streamer components.

All numbers are in kbps.

* State properties: `bitrates: Array<number>`, `currentBitrate: number`.
* State properties indicating overrides to full automatic adaptive quality switching: `bitrateFix: number` or `bitrateCap: number`.
* Overrides to adaptive quality selection: `setProperty({ bitrateFix: number | string })`, `setProperty({ bitrateCap: number })`

### Buffer level

The state property `bufferedAhead: number` indicates the number of seconds forward that is currently in the playback buffer.

### Currently displayed subtitles (if any) and available subtitles
 
Different text tracks correspond to different subtitles sets, typically different language options.

The properties for `AvailableTrack` expose presentational and technical metadata for each alternative subtitle track.

As indicated by the question mark in the definition below, `currentTextTrack` can have the value `null`, or the `selectedTextTrack` property can be set to `null`. This indicates that no subtitles are selected for display.

* State properties: `textTracks: Array<AvailableTrack>`, `currentTextTrack: ?AvailableTrack`. 
* Playback manipulation: `setProperty({ selectedTextTrack: ?AvailableTrack })`

### Current audio track playing and all available audio tracks

Audio tracks are often representing different audible languages. The two audio track properties works similarly to the text tracks properties. Note that it is not possible to not select any audio track. However, it is not guaranteed that the `currentAudioTrack` property is not `null`.

* State properties: `audioTracks: Array<AvailableTrack>` and `currentAudioTrack: ?AvailableTrack` 
* Playback manipulation: `setProperty({ selectedAudioTrack: AvailableTrack })`

### Volume level and mute state

These simple rules apply: `0 ≤ volume ≤ 1`, and the two properties are updated independently, so that `volume` can e.g. have the value `0.33`, while `isMuted` is `true`.

* State properties: `volume: number`, `isMuted: boolean`.
* Playback manipulation: `setProperty({ volume: number })`, `setProperty({ isMuted: boolean })`

## Containment for the player UI

TODO: Link to API reference.

There are some concerns not directly related to visual player UI components, but important for presenting the complete player UI with video. These are addressed in separate functions or components, but also gathered in `<PlayerUIContainer />` and used in the Replay default player component. They can be picked separately for other player UIs.

### Fixed aspect ratio

`<AspectRatio/>` constrains the visual height of the player according to the available width. This makes an inserted player adapt to any width, and renders it with a corresponding height, typically by a 16:9 ratio.

### Fullscreen

`<Fullscreen/>` passes down methods in its render prop to be used for entering and exiting fullscreen state for the component's child elements. This enables fullscreen video playback including the custom player UI and controls.

### Detecting user activity/interactions

`<InteractionDetector/>` can be used for showing/hiding player controls and other UI elements based on user activity. It exposes a boolean property `isUserActive` as a render prop parameter. This is set to true or false based on mouse or touch activity, and allows for delays before reverting to `false`.

### Keyboard shortcuts

`<KeyboardShortcuts/>` can manipulate several aspects of the playback state based on configured shortcut keys:

* Playback position (skipping backwards/forward)
* Pause/play toggling.
* Fullscreen toggling.
* Mute toggling.
* Volume up/down.

### Remembering user's preferences for audio tracks, text tracks, and volume/mute.

There are two helpers facilitating storage and reapplication of the user's selections for volume, mute, audio or text track language, audio or text track kind.

`<PreferredSettingsApplicator/>` applies the stored settings when the playback is starting. This includes finding the text or audio track with the best match for the stored language and kind codes.

`withSettingsStorage(Component: React.Component)` creates a higher order component from any control, monitoring the user's selections propagated through the `setProperty({ prop: value })` callback. I.e. when `setProperty({ isMuted: true })` is called from the wrapped component, it will be stored to the settings storage, before propagated to the controller (assuming the HOC is connected to the player controller).

The different settings can be configured individually to be stored in either the browser's `localStorage` or `sessionStorage`. It is also possible to pass props with the same name as the different settings to the ´<PreferredSettingsApplicator/>´ component, which allows for having a different source or outside source for the preferences.

### Exposing player state through CSS classes

According to playback state, several prefixed class names can be added to the container element. This allows for CSS decendant rules toggling the appearance of player controls and other UI parts. For instance, the class name `'replay-is-live'` can be added for the container `<div/>` if the currently playing stream is live. Easiest understood by inspecting the Replay `<div/>` in the browser's dev tools during playback.

With the class name above, for instance an overlay saying "LIVE" can be made visible based on a rule lke this:

```css
.replay-my-live-overlay {
  display: none;
}

.replay-is-live .replay-my-live-overlay {
  display: block;
}
```


