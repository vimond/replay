# Using the Replay player

*This document will enable live edit and render the code examples when run with x0 doc server.*

*Note that all examples underneath with actual video include the `initialPlaybackProps={{ isPaused: true }}` prop, so that the examples don't play wildly all over the page. Please remove when copying to real app code.*

All props are to be documented in the [Replay component API docs](#) (TODO).

## Inserting the player and playing videos

### Prerequisites

#### Installing the Replay npm package

If not already done:

```sh
npm install vimond-replay --save
```

#### Importing dependencies

All code examples below need the following import statements:

```javascript
import React from 'react';
import { Replay } from 'vimond-replay';
import 'vimond-replay/lib/index.css'; 
// Or substitute the CSS module import statement with your desired CSS inclusion mechanism.
```

#### Video/stream technology support

Out of the box, Replay supports progressive videos that can be played natively in the browser. For customers, Vimond provides pluggable wrappers for adaptive streaming playback libraries.

### Inserting the player and starting it with progressive video

Include the `source` prop in order to load a video. This prop can be a string with the video URL, or an object containing several pieces of technical details in order to play the video/stream appropriately. Essential is the `streamUrl` property, referring to the video file or adaptive stream URL (if applicable). The object variant is shown in later examples.

```.jsx
<Replay
  source="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  initialPlaybackProps={{ isPaused: true }}
/>
```

When the object specified as the `source` prop is changed, a new playback will start. Set the same prop to null in order to stop playback.

### Starting playback from a different position than the beginning

The `startPosition` property treats any positive numbers as the number of seconds offset from the beginning.

Note that specifying source as a string doesn't work anymore, and an object with the property streamUrl must be passed as the `source` prop.

```.jsx
<Replay
  source={{ 
    streamUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    startPosition: 13
  }}
  initialPlaybackProps={{ isPaused: true }}
/>
```

### Setting volume and mute state for startup

The `initialPlaybackProps` prop can be used to specify a state for volume, pausing, quality selection policies, to be applied on playback startup. These properties can be changed by the playback itself or through the player's user interface. There is no persisting consistency between what being set here, and the actual state during playback, so that's why these are specified as `initialPlaybackProps` only.

The following video will start paused, but when started playing it will happen without audio. When unmuting, the volume level will be set to 20 %.

```.jsx
<Replay
  source="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  initialPlaybackProps={{ isPaused: true, isMuted: true, volume: 0.2 }}
/>
```

### Specifying text tracks along with the video source

Subtitle files of different languages and kinds can be specified as text tracks along with the stream URL. There are requirements to the metadata fields following the subtitle file URLs.

```.jsx
<Replay
  source={{ 
    streamUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    textTracks: [{
      src: 'example-media/en.vtt',
      kind: 'subtitles',
      language: 'en',
      label: 'English',
      contentType: 'text/vtt'
    }, {
      src: 'example-media/no.vtt',
      kind: 'subtitles',
      language: 'no',
      label: 'Norwegian',
      contentType: 'text/vtt'
	}]
  }}
  initialPlaybackProps={{ isPaused: true }}
/>
```

Observe that this reveals the **T** subtitles button and selector in the controls bar. Also note that the subtitles are not selected for display by default. Specifying the preferred subtitles upon inserting the player, is a planned Replay feature.

### Setting (new) text tracks after starting playback of video source

If the text tracks are not available when starting the stream, or when a current set of tracks should be replaced without interrupting playback, specify the new track set in the `textTracks` prop.

```.jsx
<Replay
  source="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  initialPlaybackProps={{ isPaused: true }}
  textTracks={[{
	  src: 'example-media/en.vtt',
	  kind: 'subtitles',
	  language: 'en',
	  label: 'English',
	  contentType: 'text/vtt'
  }, {
	  src: 'example-media/no.vtt',
	  kind: 'subtitles',
	  language: 'no',
	  label: 'Norwegian',
	  contentType: 'text/vtt'
  }]}
/>
```

### Observing the stream playback state

Playback state consists of playback position, duration, stream mode, pause, seek, and buffering state, available text and audio tracks, bitrate (if adaptive streaming is used).

The `onStreamStateChange` callback prop is invoked when the playback state changes. The callback is invoked with an object containing the changes as keys/values.

```javascript
this.handleStreamStateChange = stateProperties => {
  if ('position' in stateProperties) {
    console.log('Playback position is', stateProperties.position);
  }
  if ('volume' in stateProperties) {
    console.log('The volume is changed into', stateProperties.volume);
  }
  if (stateProperties.isPaused) {
    console.log('The playback was paused.');
  }
};
```

See TODO for a full reference of state properties.

### Controlling the playback programmatically

Playback methods can be passed to Replay component consumers through a callback prop `onPlaybackMethodsReady`.

`setProperty()` is one common method that can be used for all playback operations. This method is passed along with `play()`, `setPosition()`, `capBitrate()` etc. The latter are just sugar methods that call `setProperty()`. It accepts an object with the properties to be set.

See TODO for a full reference of playback methods.

See TODO for a full reference of playback properties that can be used with setProperty.

Another method returned is `inspect()`. This returns an object with the current playback state, containing properties also exposed through the `onStreamStateChange` callback.

It is recommended to keep track of the state through an `onStreamStateChange` callback instead of using inspect().

```javascript
const playbackMethodsReady = methods => {
  this.playVideo = methods.play;
  this.setPlaybackPosition = methods.setPosition;
  this.setPlaybackProperty = methods.setProperty;
}

/// In e.g. click handlers for buttons outside the Replay player.

this.handleRestartClick = () => {
  if (this.setPlaybackPosition) {
    this.setPlaybackPosition(0);
  }
};

this.handleStartClick = () => {
  if (this.playVideo) {
    this.playVideo();
  }
};

this.handleUnmuteClick = () => {
  if (this.setPlaybackProperty) {
    this.setPlaybackProperty({ isMuted: false });
  }
}; 

```

The following code excerpt illustrates how to apply the callback methods mentioned in this and the previous chapter.

```jsx
<Replay
  source={{ 
    streamUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    startPosition: 13
  }}
  initialPlaybackProps={{ isPaused: true }}
  onStreamStateChange={this.handleStreamStateChange}
  onPlaybackMethodsReady={this.playbackMethodsReady}
/>
```

### Activating the close button with an onExit callback

Observe the close (×) button overlaid in the upper right corner, when the `onExit` callback prop is specified:

```.jsx
<Replay
  source={{ 
    streamUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    startPosition: 13
  }}
  initialPlaybackProps={{ isPaused: true }}
  onExit={() => alert('The player was closed.')}
/>
```

The container component inserting the `<Replay/>` component is responsible for removing it from the rendered UI tree.

### Getting notified about stream and playback errors

The `onError` prop expects a function taking one parameter containing a `PlaybackError` object wrapping the underlying raw error.

```.jsx
<Replay
  source="http://example.com"
  onError={err => console.log('This is an example playback error intentionally triggered.', { code: err.code, message: err.message })}
/>
```
The error message found in the code example should be present in the web browser's Javascript console.

### Mock player for design mode

The `<MockVideoStreamer/>` component can be used in design mode, when loading and playing an actual video will be too annoying. This is a component substituting the actual video streaming rendering component, inserted by default. It should be added as the only child element of `<Replay/>`.

The MockVideoStreamer exposes a fake playback state, and responds to playback operations.

It needs to be imported:

```javascript
import { Components } from 'vimond-replay';
const { MockVideoStreamer } = Components;
```

Also, it is convenient blocking the automatic hide of the controls bar in development and design mode. This can be done with the configuration option `inactivityDelay: -1` as shown below:

```.jsx
<Replay options={{ interactionDetector: { inactivityDelay: -1 }}}>
  <MockVideoStreamer/>
</Replay>
```

## Playing advanced streams

#### Using adaptive video streamers

#### Specifying DRM information as part of the video source

#### Specifying a single or maximum quality for adaptive streams


