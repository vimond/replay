# Player examples

## Inserting the player and playing videos

### Starting player with MP4 video, muted and paused

```.jsx
<Replay
  source={{ 
    streamUrl: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4'
  }}
  startPaused={true}
  startVolume={0.3}
/>
```

### Mock player for design mode


## Customising the player

This shows a custom overlay toggling pause state.

