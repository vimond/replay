# Customising the Replay player

*Most of the player code examples in this guide use the [MockVideoStreamer](insert#mock-player-for-design-mode), so that the live examples don't load actual videos.*

## Configuring the player

### Configuration system

The player contains a configuration system where all aspects of the player can be configured in one object with keys and properties grouped by functionality.

The Replay player component comes with a base configuration, and one essential feature is the possibility of overriding anything from this base configuration.

The configuration object structure is defined in TODO: Link to the PlayerConfiguration type.

Underneath is an example of the most interesting configuration settings in the player's base configuration.

```javascript
export const baseConfiguration: PlayerConfiguration = {
  interactionDetector: {
    inactivityDelay: 2
  },
  keyboardShortcuts: {
    keyMap: {
      togglePause: [' ', 'Enter'],
      toggleFullscreen: 'F',
      decreaseVolume: '-',
      increaseVolume: '+',
      skipBack: ',',
      skipForward: '.',
      toggleUserActive: 'C',
      toggleMute: 'M'
    }
  },
  ui: {
    skipButtonOffset: -10,
    qualitySelectionStrategy: 'cap-bitrate',
    liveDisplayMode: 'clock-time'
  }
};
```
### Overriding the configuration

Configuration overrides can be specified through the `options` prop. Pass an object with the configuration setting keys to be overridden, following the same structure as in the `baseConfiguration`, or as defined in the `PlayerConfiguration` type.

```.jsx
<Replay 
  options={{ 
    interactionDetector: { 
      inactivityDelay: 10 
    }, 
    ui: { 
      liveDisplayMode: 'live-offset' 
    },
    keyboardShortcuts: { 
      keyMap: {
        togglePause: [' ', 'Enter', 'P']
      }
    }
  }}>
  <MockVideoStreamer/>
</Replay>
```

The overrides in this example changes the following, compared to the base configuration above: 

* The player controls are hidden after 10 seconds, instead of 2.
* For a live stream, the position will be displayed as an offset from the live edge, instead of time-of-day clock time (if applicable).
* All the keyboard keys `Enter`, `Space`, and `P` can be used to toggle pause/playing. In the base configuration only `Enter` and `Space` were defined as shortcuts for this operation.

### Including or omitting player controls by configuration

As described further down, the full player UI can be substituted and customised with completely different controls (i.e. React components). However, for simpler customisations, individual controls can be included or excluded by adding a configuration override.

The array `{ ui: { includeControls: [] }}` can be used to specify what controls to include. If this configuration setting is omitted, all controls will be included. Otherwise, only the ones listed in the array will be listed.

For a full list of possible control names, see TODO.

```.jsx
<Replay 
  options={{ 
    ui: { 
      includeControls: ['playPauseButton', 'timeline', 'timeDisplay', 'volume', 'fullscreenButton']
    },
    interactionDetector: { 
      inactivityDelay: 10 
    }
  }}>
	<MockVideoStreamer/>
</Replay>
```
This example leaves only the most basic and common controls present in the control bar.


### Summary of configuration settings

TODO.

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
  ({ isPaused, setProperty }) => 
    <div 
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer'}} 
      onClick={() => setProperty({ isPaused: !isPaused })}
    />, 
  ['isPaused']
);
```

Observe the `connectControl()` call wrapping it as a higher-order component. This connects the component to the player controller, whose responsibility is to expose the video streamer component and its state and API to components anywhere in the player UI tree. In this case, we specify that the `isPaused` property should be exposed as a prop to our custom React component. `connectControl()` also passes down an `setProperty()` method to the component, allowing for manipulating the video playback.

Note that all other Replay provided controls, operating on the playing video (video streamer), are already connected with `connectControl()`, when used in the default player UI.

More about the player controller, video streamer, and controls relationship in this article. TODO: link.
