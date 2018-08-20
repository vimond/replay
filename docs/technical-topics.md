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

Consumers of the library should automatically have the Flow types of Replay, components, and other exposed parts, available.

## Styling and class name principles

This chapter describes the approach to class naming and style rules.

### Prefixed class names

All controls and container components have prefixed class names. The default prefix is `replay-`, and a full class name will then for instance be `replay-play-pause-button`. The prefix can be changed when creating custom players. In this way, the player can get different skins coexisting in the same CSS scope. I.e. a common site-wide CSS bundle can contain different skins for Replay players branded differently according to e.g. content category.

### Not [BEM](http://getbem.com/naming/), but...

Controls typically have several class names: One corresponding to the control's name and purpose, and one for the generic component(s) used in the control, and maybe one or more for the state of the control. For instance the PlayPauseButton's root element gets the following class attribute with the default prefix: `class="replay-play-pause-button replay-toggle-button replay-toggled-off"`.

### Reuse-oriented stylesheets

The CSS is organised with rules that apply to many distinct components or controls, and with modifier rules based on class names set further up in the DOM hierarchy. This is the traditional approach, contrary to an "object-oriented" stylesheet, where CSS rules are tightly coupled to components.

In practice:

* Some style rules apply to multiple controls. I.e. all control buttons share a lot of styling through common class names.
* The container element for the full UI sets a lot of class names based on the player state. This can be, and is used to create style rules with descendant selector.

### CSS module organisation

For reference, in the Replay code base, the default stylesheet is built with several CSS files with the following setup. However, replacement stylesheets can be organised independently of the default one.
* Some distinct, but general CSS files when there is a requirement for styles specifically for a component/control. These are located in the `components/` hierarchy and contain no skin or layout styles.
* Style rules for the default skin, organised in different files, located in `default-player/default-skin/`: `sizesAndLayout.css`, `colors.css`, `animations.css`, and assembled with some more styles in `index.css`.
* `replay-default.css` includes all above and constitutes the full default stylesheet.

## Specifying what to play, i.e. the video sources

The VideoStreamer prop `source` can be a string for the video URL in the basic cases. When passing an object with at least a `streamUrl` property instead, several other technical details can optionally be specified at the same time.

* Side-loaded subtitles.
* A position to start playback from, offset from the start of the video.
* DRM information for premium streams.
* Playback technology for the stream specified in the `streamUrl` property. This is relevant for other VideoStreamer implementations covering more than technology.

The VideoStreamer closes down any current playback and starts a new one if the source object changes. In other words, *referential inequality* for the `source` object will also change the playback. If changing the `streamUrl` property of the existing object passed to the video streamer `source` prop, this will not be detected as a changed source in the video streamer.

Specify a nullish `source` prop in order to shut down playback, or not start a playback when the video streamer or Replay player is inserted.

```javascript
// TODO: Example of complex source object here.
```


## How to control or observe all aspects of playback

Use `connectControl()` in order to expose the video streamer API to custom components.

TODO: List APIs for the tasks below.

### Playback state

* Current playback position and duration of the stream or video file. For live streams also clock time for a stream position.
* Play state: Is the stream paused, has it ended, is it buffering, is a seeking operation going on?
* Stream mode: On demand, live, timeshifting availability.
* Current bitrate and available qualities for a stream.
* Buffer level.
* Currently displayed subtitles (if any) and available subtitles (typically different language options).
* Current audio track playing and all available audio tracks (typically different language options).
* Volume level and mute state.

### Playback operations

* Seek to a different stream position or timeshift or resume from live edge in a live stream.
* Pause/play toggle.
* Override adaptive bitrate selection with a specific quality setting or capping the quality selection.
* Select subtitles or switch audio tracks.
* Adjust the volume or mute/unmute the playback.
* Specifying what to play: Stream URLs, subtitles URLs, and associated technical details.

## Containment for the player UI

## Creating a VideoStreamer component
