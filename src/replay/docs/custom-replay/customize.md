This document gathers some earlier written docs not adapted to current doc structure.

# Customising the Replay player

## Customising the UI and appearance

### The Replay player factory

The `<Replay/>` component is created through a factory:

```javascript
const Replay = createCustomPlayer({
  name: 'Replay',
  graphics: graphics,
  strings: strings,
  configuration: baseConfiguration,
  resolveVideoStreamerMethod: applyStreamer
});
```

Similarly, this factory method can be used for building custom players. Some or all parameters can be changed, replacing the defaults. One benefit of this method is that the original data is not referred anymore, reducing code bloat and bundle sizes.

### Changing the graphics or texts

The default graphics are assembled and provided through graphics.js (TODO: link). This file picks SVG icons from the graphics set `react-feather`, and maps them to a structure defined by the default player user interface. Basically the structure contains keys for each UI component requiring graphics, and subkeys specifying the component/control prop where the icon should be supplied.

Correspondingly, the texts appearing in the player controls and UI, are defined in strings.js (TODO: link).

The full set of icons can be replaced by passing an object with the same shape with the key `graphics` to the `createCustomPlayer()` method. The same goes for the texts.

This is shown in the following example, however for simplicity, the original icon set and strings set are cloned. Only the graphics for the play/pause toggle are substituted, while the subtitles selector texts are changed.

```javascript
import { Components } from 'vimond-replay';
const { MockVideoStreamer } = Components;
import graphics from 'vimond-replay/default-player/default-skin/graphics';
import strings from 'vimond-replay/default-player/default-skin/graphics';

const myCustomGraphics = {
  ...graphics,
  playPauseButton: {
    playingContent: <em>Pa</em>,
    pausedContent: <em>Pl</em>
  }
};

const myCustomStrings = {
  ...strings,
  subtitlesSelector: {
    label: 'Captions',
    noSubtitlesLabel: 'No captions'
  }
};

const MyCustomPlayer = createCustomPlayer({
  name: 'MyCustomPlayer',
  graphics: myCustomGraphics,
  strings: myCustomStrings,
  videoStreamerComponent: MockVideoStreamer
});
```

*Unfortunately the documentation tool doesn't allow for live editing of Javascript yet.*

Observe that when using `createCustomPlayer()`, whether to use the `<MockVideoStreamer/>`, or the default real video renderer, `<BasicVideoStreamer/>`, needs to be specified with the parameter `videoStreamerComponent`.

```.jsx
<MyCustomPlayer options={{ interactionDetector: { inactivityDelay: -1 }}} />
```
Observe that the rendered player contains the texts *Pa* or *Pl* instead of the familiar play/pause icons. Also observe the tooltip "Captions" on the subtitle button, while the lower subtitles menu option says "No captions".

### Changing the CSS styles

Currently, styles must be defined separately from the components. As the insert guide shows, the default styles are bundled to one file and must be included to the page either through `import` statements assisted by bundler tools (e.g. Webpack), SASS imports, or even direct references in the web page, if desired.

Then, changing the styles is a matter of either replacing the default stylesheet, or adding style rules overriding the default stylesheet.

Principles for [styling and class names](technical-topics#styling-and-class-name-principles).

Refer to the component API reference (TODO: when written) for possible class names.

### Customising the player UI component tree

The player UI consists of container components for the full player, controls, and some overlays. The default UI is found in playerUI.js (TODO: link). 

Besides the parameters for `createCustomPlayer()` discussed above, and instead of the `graphics` and `strings` parameters, this method can also take a parameter `uiRenderMethod`. This is like a render prop in a React component, and can be used to add a custom UI:

```javascript
const MyCustomPlayer = createCustomPlayer({
  name: 'MyCustomPlayer',
  uiRenderMethod: ({ externalProps, configuration }) => <MyPlayerUI externalProps={externalProps} configuration={configuration} />
  videoStreamerComponent: MockVideoStreamer
});
```
Due to limitations to the live code editor, the following example uses one of the underlying components consuming the render prop passed through `uiRenderMethod`, instead of showing the method passed to `createCustomPlayer()`. That means that the method that shoule be pased to `uiRenderMethod`, is just inlined in the JSX code.

This example includes a somewhat simplified copy of the actual default Replay UI. You can live edit the UI while playing an actual video. 

A title overlay is added as a custom UI detail. Further, a component allowing for toggling play/pause by clicking the video area, is defined with the name `<MyPlayPauseOverlay/>` and included. This component is discussed below.

In your real code, any components with data can be brought in. All Replay components and the element tree can be substituted.

```.jsx
<PlayerController
  initialPlaybackProps={{ isPaused: true }}
  configuration={baseConfiguration}
  render={({externalProps, configuration}) => (
    <PlayerUIContainer
      configuration={configuration}
      classNamePrefix={classNamePrefix}
      render={({ fullscreenState, interactionState }) => (
        <React.Fragment>
          <ControlledVideoStreamer classNamePrefix={classNamePrefix} />
          <MyPlayPauseOverlay/>
          <h5 className="title-overlay" style={{ opacity: interactionState.isUserActive ? 1 : 0, margin: 0, color: 'white', backgroundColor: 'rgba(0,0,0,0.8)', position: 'absolute', top: 0, width: '100%', padding: '1em 2em', fontSize: '18px'}}>
            My video title
          </h5>
          <ControlsBar>
            <PlayPauseButton {...strings.playPauseButton} {...graphics.playPauseButton} classNamePrefix={classNamePrefix} />
            <SkipButton offset={10} {...strings.skipButton} {...graphics.skipButton} classNamePrefix={classNamePrefix} />
            <Timeline {...strings.timeline} {...graphics.timeline} classNamePrefix={classNamePrefix} />
            <TimeDisplay liveDisplayMode="clock-time" {...strings.timeDisplay} classNamePrefix={classNamePrefix} />
            <GotoLiveButton {...strings.gotoLiveButton} {...graphics.gotoLiveButton} classNamePrefix={classNamePrefix} />
            <Volume {...strings.volume} {...graphics.volume} />
            <AudioSelector {...strings.audioSelector} {...graphics.audioSelector} classNamePrefix={classNamePrefix} />
            <SubtitlesSelector {...strings.subtitlesSelector} {...graphics.subtitlesSelector} classNamePrefix={classNamePrefix} />
            <QualitySelector
              {...strings.qualitySelector}
              {...graphics.qualitySelector}
              selectionStrategy={"fix-bitrate"}
              classNamePrefix={classNamePrefix}
            />
            <FullscreenButton {...fullscreenState} {...strings.fullscreenButton} {...graphics.fullscreenButton} classNamePrefix={classNamePrefix} />
          </ControlsBar>
          <BufferingIndicator {...strings.bufferingIndicator} {...graphics.bufferingIndicator} classNamePrefix={classNamePrefix} />
        </React.Fragment>
      )}
    />
  )}>
  <BasicVideoStreamer
    source={{ 
      streamUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      startPosition: 13
    }}
  />
</PlayerController>
```

#### Some things to observe

* The example shows a custom overlay, displaying the video title when the user is active. It utilises a render parameter passed by the utility container component, `<PlayerUIContainer/>`, indicating the user activity state.
* Passing the graphics and strings clutters the code significantly. Other approaches might be considered for custom UIs.
* `A <BasicVideoStreamer/>` rendering the actual video, is the child element of the PlayerController element. This is rendered at the correct place in the UI element tree through the `<ControlledVideoStreamer/>` element.

#### `<MyPlayPauseOverlay/>`: A connected control

This custom component in the example above is defined with the following code:

```javascript
const MyPlayPauseOverlay = connectControl(
  ({ isPaused, setProperties }) => 
    <div 
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer'}} 
      onClick={() => setProperties({ isPaused: !isPaused })}
    />, 
  ['isPaused']
);
```

Observe the `connectControl()` call wrapping it as a higher-order component. This connects the component to the player controller, whose responsibility is to expose the video streamer component and its state and API to components anywhere in the player UI tree. In this case, we specify that the `isPaused` property should be exposed as a prop to our custom React component. `connectControl()` also passes down an `setProperties()` method to the component, allowing for manipulating the video playback.

Note that all other Replay provided controls, operating on the playing video (video streamer), are already connected with `connectControl()`, when used in the default player UI.

More about the player controller, video streamer, and controls relationship in this article. TODO: link.


# Guides to components and consuming playback state


### Positions, clock times, durations, DVR

Current playback `position` and `duration` of the stream or video file are exposed in properties with these two names. Both for live DVR streams and on demand streams, the range limitation `0 ≤ position ≤ duration` applies. The position can be changed within the same range with `setProperties({ position: newPosition })`, and again both with live DVR and on demand streams.

For live streams, duration constitutes the DVR seekable range, and can change during playback. When playing at the live edge, `position ≈ duration`.

Note that for live streams with a sliding DVR window, the position might remain constant even if playback progresses. For this, live streams also expose clock time for the current stream position, through `absolutePosition`. Use this for indicating actual playback progress, since position might be unchanging when the offset or seekable range is not changing.

* State properties: `position: number`, `duration: number`, `absolutePosition: Date`, `absoluteStartPosition: Date`.
* Playback manipulation: `setProperties({ position: number })`, `setProperties({ isAtLiveEdge: true })`.

### Play state as phases of a video playback

An "enum" or set of different strings are exposed in the `playState: PlayState` property, with values like `'inactive'`, `'playing'`, `'buffering'`, etc. This is a one-dimensional way of expressing the playback state, and doesn't address that a stream can be both `'paused'` and `'buffering'`, for instance.

### Is the stream paused, is it buffering, is a seeking operation going on?

When `playState` is only indicating one of possibly two or three concurrent states, the following boolean state properties are updated independently, and more than one can be `true` at a time:

* State properties: `isBuffering: boolean`, `isSeeking: boolean`, `isPaused: boolean`.
* Playback manipulation: `setProperties({ isPaused: boolean })`

### Stream mode: On demand, live. Timeshifting availability

The state property `playMode: PlayMode` can contain three string values, `'ondemand'`, `'livedvr'`, `'live'`. The latter indicates a live stream which is not seekable.  `'livedvr'` indicates a live stream which can be timeshifted, i.e. allows for seeking. On demand streams can always be seeked.

`isAtLiveEdge: boolean` is set to false when a live playback is timeshifted. Use `setProperties({ isAtLiveEdge: true })` in order to change this property into true`.

### Current bitrate and available qualities for a stream

Does not apply to `<BasicVideoStreamer/>`, due to missing capabilities of the `HTMLVideoElement`. It is however relevant for adaptive streaming player libraries wrapped as video streamer components.

All numbers are in kbps.

* State properties: `bitrates: Array<number>`, `currentBitrate: number`.
* State properties indicating overrides to full automatic adaptive quality switching: `bitrateFix: number` or `bitrateCap: number`.
* Overrides to adaptive quality selection: `setProperties({ bitrateFix: number | string })`, `setProperties({ bitrateCap: number })`

### Buffer level

The state property `bufferedAhead: number` indicates the number of seconds forward that is currently in the playback buffer.

### Currently displayed subtitles (if any) and available subtitles
 
Different text tracks correspond to different subtitles sets, typically different language options.

The properties for `AvailableTrack` expose presentational and technical metadata for each alternative subtitle track.

As indicated by the question mark in the definition below, `currentTextTrack` can have the value `null`, or the `selectedTextTrack` property can be set to `null`. This indicates that no subtitles are selected for display.

* State properties: `textTracks: Array<AvailableTrack>`, `currentTextTrack: ?AvailableTrack`. 
* Playback manipulation: `setProperties({ selectedTextTrack: ?AvailableTrack })`

### Current audio track playing and all available audio tracks

Audio tracks are often representing different audible languages. The two audio track properties works similarly to the text tracks properties. Note that it is not possible to not select any audio track. However, it is not guaranteed that the `currentAudioTrack` property is not `null`.

* State properties: `audioTracks: Array<AvailableTrack>` and `currentAudioTrack: ?AvailableTrack` 
* Playback manipulation: `setProperties({ selectedAudioTrack: AvailableTrack })`

### Volume level and mute state

These simple rules apply: `0 ≤ volume ≤ 1`, and the two properties are updated independently, so that `volume` can e.g. have the value `0.33`, while `isMuted` is `true`.

* State properties: `volume: number`, `isMuted: boolean`.
* Playback manipulation: `setProperties({ volume: number })`, `setProperties({ isMuted: boolean })`

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

`withSettingsStorage(Component: React.Component)` creates a higher order component from any control, monitoring the user's selections propagated through the `setProperties({ prop: value })` callback. I.e. when `setProperties({ isMuted: true })` is called from the wrapped component, it will be stored to the settings storage, before propagated to the controller (assuming the HOC is connected to the player controller).

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