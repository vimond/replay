//@flow
import React, { Component } from 'react';
import { Persist } from 'react-persist';
import MockPlayer from './replay/default-player/MockPlayer';
import { Replay } from './replay/';
import type { PlayerConfiguration } from './replay/default-player/types';
import './App.css';
import './replay/replay-default.css';
import type { PlaybackActions } from './replay/components/player/PlayerController/PlayerController';
import { PlaybackError } from './replay/components/player/VideoStreamer/types';
import type { PlaybackSource, SourceTrack } from './replay/components/player/VideoStreamer/types';
import CompoundVideoStreamer from './replay/components/player/VideoStreamer/CompoundVideoStreamer/CompoundVideoStreamer';
// import RxVideoStreamer from './replay/components/player/VideoStreamer/RxVideoStreamer/RxVideoStreamer';

type State = {
  useMock?: boolean,
  source: PlaybackSource | null,
  alwaysShowDesignControls: boolean,
  textTracks?: ?Array<SourceTrack>
};

const initialPlaybackProps = { isPaused: true, volume: 0.7 };

const exampleMediaPath = process.env.PUBLIC_URL + '/example-media/';

const textTracks = [
  {
    kind: 'subtitles',
    language: 'no',
    src: exampleMediaPath + 'subtitles/no.vtt',
    contentType: 'text/vtt;charset="UTF-8"',
    label: 'Norsk'
  },
  {
    kind: 'subtitles',
    language: 'en',
    src: exampleMediaPath + 'subtitles/en.vtt',
    contentType: 'text/vtt;charset="UTF-8"',
    label: 'English'
  },
  {
    kind: 'captions',
    language: 'no',
    src: exampleMediaPath + 'subtitles/no-captions.vtt',
    contentType: 'text/vtt;charset="UTF-8"',
    label: 'Norsk (th)'
  },
  {
    kind: 'captions',
    language: 'en',
    src: exampleMediaPath + 'subtitles/en-captions.vtt',
    contentType: 'text/vtt;charset="UTF-8"',
    label: 'English captions'
  }
];

const videoSources = [
  {
    description: 'Demo HLS stream',
    streamUrl: exampleMediaPath + 'adaptive.m3u8',
    contentType: 'application/x-mpegurl'
  },
  {
    description: 'Demo MP4 file',
    streamUrl: exampleMediaPath + 'progressive.mp4',
    contentType: 'video/mp4'
  }
];

const configOverrides: PlayerConfiguration = {
  videoStreamer: {
    logLevel: 'WARNING'
  },
  playbackMonitor: {
    visibleAtStart: false
  },
  controls: {
    //includeControls: ['playPauseButton', 'timeline', 'timeDisplay', 'gotoLiveButton', 'volume', 'fullscreenButton', 'exitButton']
  }
};

const alwaysDisplayControlsConfig = {
  interactionDetector: {
    inactivityDelay: -1
  }
};

const getPlayerOptionsFromState = state => {
  if (state.alwaysShowDesignControls) {
    // Add override when needed.
    return alwaysDisplayControlsConfig;
  }
};

class App extends Component<void, State> {
  constructor() {
    super();
    this.state = {
      useMock: true,
      alwaysShowDesignControls: true,
      source: videoSources[0]
    };
    window.setState = stateProps => this.setState(stateProps);
  }

  togglePlayer = () => this.setState({ useMock: !this.state.useMock });

  toggleShowDesignControls = () => this.setState({ alwaysShowDesignControls: !this.state.alwaysShowDesignControls });

  handleStreamUrlFieldChange = (evt: SyntheticEvent<HTMLInputElement>) =>
    this.setState({ source: evt.currentTarget.value });

  handleVideoButtonClick = (index: number) => this.setState({ source: videoSources[index] });
  handleNoVideoClick = () => this.setState({ source: null });

  handleError = (err: PlaybackError) =>
    console.error('%s [%s] %s: %s', err.severity, err.technology, err.code, err.message, err.sourceError);

  handlePlaybackActions = (actions: PlaybackActions) => {
    window.player = actions;
  };

  toggleTextTracks = () => {
    if (this.state.textTracks) {
      this.setState({ textTracks: null });
    } else {
      this.setState({ textTracks });
    }
  };

  exitPip = () => {
    // $FlowFixMe Typedefs up to date.
    document.exitPictureInPicture && document.exitPictureInPicture();
  };

  render() {
    const { alwaysShowDesignControls, source, useMock, textTracks } = this.state;
    return (
      <div className="App">
        <div className="App-player-panel">
          {useMock ? (
            <div>
              <MockPlayer
                options={{ ...configOverrides, ...getPlayerOptionsFromState(this.state) }}
                onExit={this.togglePlayer}>
                Design mode
              </MockPlayer>
              <p>
                <input
                  id="toggleAlwaysShowControls"
                  checked={alwaysShowDesignControls}
                  type="checkbox"
                  onChange={this.toggleShowDesignControls}
                />
                <label htmlFor="toggleAlwaysShowControls">Never hide the controls bar.</label>
              </p>
            </div>
          ) : (
            <div>
              <Replay
                source={source}
                options={configOverrides}
                onExit={this.togglePlayer}
                onError={this.handleError}
                textTracks={textTracks}
                initialPlaybackProps={initialPlaybackProps}
                onPlaybackActionsReady={this.handlePlaybackActions}>
                <CompoundVideoStreamer />
              </Replay>
              <p>
                <input
                  type="url"
                  value={source ? (typeof source === 'string' ? source : source.streamUrl) : ''}
                  onChange={this.handleStreamUrlFieldChange}
                />
              </p>
              <p className="buttons-row">
                {videoSources.map((s, index) => (
                  <button key={'v-' + index} onClick={() => this.handleVideoButtonClick(index)}>
                    {s.description}
                  </button>
                ))}
                <button onClick={this.handleNoVideoClick}>No video</button>
                <button onClick={this.toggleTextTracks}>Toggle text tracks</button>
                <button onClick={this.exitPip}>Exit PiP</button>
              </p>
            </div>
          )}
        </div>
        <Persist name="app-state" data={this.state} onMount={data => this.setState(data)} />
      </div>
    );
  }
}

export default App;
