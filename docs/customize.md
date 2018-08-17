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

### Summary of configuration settings

## Customising the UI and appearance

### Including or omitting player control elements

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




TODO: This shows a custom overlay toggling pause state.
