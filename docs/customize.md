# Customising the Replay player

*All player code examples in this guide use the [MockVideoStreamer](insert#mock-player-for-design-mode), so that the live examples don't load actual videos.*

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
    keyCodes: {
      togglePause: [32, 13],
      toggleFullscreen: 70,
      decreaseVolume: [109, 189],
      increaseVolume: [107, 187],
      skipBack: 188,
      skipForward: 190,
      toggleMute: 77
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
      keyCodes: {
        togglePause: [32, 13, 80]
      }
    }
  }}>
  <MockVideoStreamer/>
</Replay>
```

The overrides in this example changes the following, compared to the base configuration above: 

* The player controls are hidden after 10 seconds, instead of 2.
* For a live stream, the position will be displayed as an offset from the live edge, instead of time-of-day clock time (if applicable).
* All the keyboard keys `Enter`, `Space`, and `P` (key codes 32, 13, 80) can be used to toggle pause/playing. In the base configuration only `Enter` and `Space` (32, 13) were defined as keyboard shortcuts.

### Including or omitting player controls by configuration

As described further down, the full player UI can be substituted and customised with completely different controls (i.e. React components). However, for simpler customisations, individual controls can be included or excluded by adding a configuration override.

The array `{ ui: { includeControls: [] }}` can be used to specify what controls to include. If this configuration setting is omitted, all controls will be included. Otherwise, only the ones listed in the array will be listed.

For a full list of possible control names, see TODO.

```.jsx
<Replay 
  options={{ 
    ui: { 
      includeControls: ['playPauseButton', 'timeline', 'timeDisplay', 'volume', 'fullscreenButton']
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

### Changing the styles (CSS)

Currently, styles must be defined separately from the components. As the insert guide shows, the default styles are bundled to one file and must be included to the page either through `import` statements assisted by bundler tools (e.g. Webpack), SASS imports, or even direct references in the web page, if desired.

Then, changing the styles is a matter of either replacing the default stylesheet, or adding style rules overriding the default stylesheet.

The styling approach follows some principles:

* All controls and container components have prefixed class names. The default prefix is `replay-`, and a full class name will then for instance be `replay-play-pause-button`. The prefix can be changed when creating custom players. In this way, the player can get different skins coexisting in the same CSS scope. I.e. a common site-wide CSS bundle can contain different skins for Replay players branded differently according to e.g. content category.
* Controls typically have several class names: One corresponding to the control's name and purpose, and one for the generic component(s) used in the control, and maybe one or more for the state of the control. For instance the PlayPauseButton's root element gets the following class attribute with the default prefix: `class="replay-play-pause-button replay-toggle-button replay-toggled-off"`.
* Some style rules apply to multiple controls. I.e. all control buttons share a lot of styling through common class names.
* The container element for the full UI sets a lot of class names based on the player state. This can be, and is used to create style rules with descendant selector.
* For reference, the default stylesheet are built with several CSS files with the following setup. However, replacement stylesheets can be organised independently of the default one.
  * Some distinct general CSS files when there is a requirement for styles specifically for a component/control. These are located in the `components/` hierarchy.
  * Style rules for the default skin, organised in different files, located in `default-player/default-skin/`: `sizesAndLayout.css`, `colors.css`, `animations.css`, and assembled with some more styles in `index.css`.
  * `replay-default.css` includes all above and constitutes the full default stylesheet.

Refer to the component API reference (TODO: when written) for possible class names.




TODO: This shows a custom overlay toggling pause state.
