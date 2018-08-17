# Using the Replay player

*Note that all examples underneath with actual video include the `startPaused={true}` prop, so that the examples don't play wildly all over the page. Please remove when copying to real app code.*

All props are to be documented in the [Replay component API docs](#) (TODO).

## Inserting the player and playing videos

### Prerequisites

#### Installing the Replay npm package

If not already done:

```
npm install vimond-replay --save
```

#### Importing dependencies

All code examples below need the following import statements:

```javascript
import React from 'react';
import { Replay } from 'vimond-replay';
import 'vimond-replay/lib/index.css'; 
// Or substitute the CSS module approach with your desired CSS inclusion mechanism.
```

#### Video/stream technology support

Out of the box, Replay supports progressive videos that can be played natively in the browser. For customers, Vimond provides pluggable wrappers for adaptive streaming playback libraries.

### Inserting the player and starting it with progressive video

Include the `source` prop in order to load a video. This prop should be an object containing several pieces of technical details in order to play the video/stream appropriately. Essential is the `streamUrl` property, referring to the video file or adaptive stream URL (if applicable).

```.jsx
<Replay
  source={{ 
    streamUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  }}
  startPaused={true}
/>
```

When the object specified as the `source` prop is changed, a new playback will start. Set the same prop to null in order to stop playback.

### Starting playback from a different position than the beginning

The `startPosition` property of the `source` object treat any positive numbers as the number of seconds offset from the beginning.

```.jsx
<Replay
  source={{ 
    streamUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    startPosition: 13
  }}
  startPaused={true}
  onExit={() => alert('The player was closed.')}
/>
```

### Setting volume and mute state for startup

This video will start playing without audio. When unmuting, the volume will be set to 20%,

```.jsx
<Replay
  source={{ 
    streamUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  }}
  startPaused={true}
  startMuted={true}
  startVolume={0.2}
/>
```

### Specifying text tracks along with the video source

Subtitle files of different languages and kinds can be specified as text tracks along with the stream URL. There are requirements to the metadata following the subtitle file URLs.

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
  startPaused={true}
/>
```

Observe that this adds the **T** subtitles button to the controls bar. Also note that the subtitles are not selected for display by default. Specifying the preferred subtitles is a planned Replay feature.

### Setting (new) text tracks for an opened video source

If the text tracks are not available when starting the stream, or when a current set of tracks should be replaced without interrupting playback, specify the new track set in the `textTracks` prop.

```.jsx
<Replay
  source={{ 
    streamUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  }}
  startPaused={true}
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

### Activating the close button with an onExit callback

```.jsx
<Replay
  source={{ 
    streamUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    startPosition: 13
  }}
  startPaused={true}
  onExit={() => alert('The player was closed.')}
/>
```

### Getting notified about stream and playback errors

The `onError` prop expects a function taking one parameter containing a `PlaybackError` object wrapping the underlying raw error.

```.jsx
<Replay
  source={{ streamUrl: '404' }}
  onError={err => console.log('This is an example playback error intentionally triggered.', { code: err.code, message: err.messages })}
/>
```

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

## Playing professional streams

#### Using adaptive video streamers

#### Specifying DRM information as part of the video source

#### Specifying a single or maximum quality for adaptive streams


