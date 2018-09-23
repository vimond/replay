//@flow
import React, { Component } from 'react';
import { Persist } from 'react-persist';
import memoize from 'memoize-one';
import MockPlayer from './replay/default-player/MockPlayer';
import { Replay } from './replay/';
import type { PlayerConfiguration } from './replay/default-player/types';
import './App.css';
import './replay/replay-default.css';

type State = {
  useMock?: boolean,
  streamUrl: string,
  alwaysShowDesignControls: boolean
};

const textTracks = [
  {
    kind: 'subtitles',
    language: 'no',
    src: 'subtitles/no.vtt',
    contentType: 'text/vtt;charset="UTF-8"',
    label: 'Norsk'
  },
  {
    kind: 'subtitles',
    language: 'en',
    src: 'subtitles/en.vtt',
    contentType: 'text/vtt;charset="UTF-8"',
    label: 'English'
  },
  {
    kind: 'captions',
    language: 'no',
    src: 'subtitles/no-captions.vtt',
    contentType: 'text/vtt;charset="UTF-8"',
    label: 'Norsk (th)'
  },
  {
    kind: 'captions',
    language: 'en',
    src: 'subtitles/en-captions.vtt',
    contentType: 'text/vtt;charset="UTF-8"',
    label: 'English captions'
  }
];

const videoUrls = [
  'https://progressive-tv2-no.akamaized.net/ismusp/isi_mp4_0/2018-07-24/S_TRENERLYGING_240718_LA(1359781_R224MP41000).mp4',
  'https://progressive-tv2-no.akamaized.net/ismusp/isi_mp4_0/2018-07-20/N_ELGBADER_200718_SIKRO_(1359389_R212MP41000).mp4'
];

const getSource = memoize(streamUrl => {
  if (streamUrl) {
    return {
      playbackTechnology: 'html',
      streamUrl,
      textTracks
    };
  } else {
    return null;
  }
});

const configOverrides: PlayerConfiguration = {
  videoStreamer: {
    dash: {
      //dashImpl: 'dashjs'
    },
    logging: {
      global: 'DEBUG'
    }
  },
  playbackMonitor: {
    visibleAtStart: false
  },
  ui: {
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
      streamUrl: videoUrls[0]
    };
    window.setState = stateProps => this.setState(stateProps);
  }

  togglePlayer = () => this.setState({ useMock: !this.state.useMock });

  toggleShowDesignControls = () => this.setState({ alwaysShowDesignControls: !this.state.alwaysShowDesignControls });

  handleStreamUrlFieldChange = (evt: SyntheticEvent<HTMLInputElement>) =>
    this.setState({ streamUrl: evt.currentTarget.value });

  handleVideoButtonClick = (index: number) => this.setState({ streamUrl: videoUrls[index] });
  handleNoVideoClick = () => this.setState({ streamUrl: '' });

  render() {
    const { alwaysShowDesignControls, streamUrl, useMock } = this.state;
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
                source={getSource(streamUrl)}
                options={configOverrides}
                onExit={this.togglePlayer}
                startVolume={0.5}
                startPaused={true}
              />
              <p>
                <input type="url" value={streamUrl} onChange={this.handleStreamUrlFieldChange} />
              </p>
              <p className="buttons-row">
                <button onClick={() => this.handleVideoButtonClick(0)}>Video 1</button>{' '}
                <button onClick={() => this.handleVideoButtonClick(1)}>Video 2</button>
                <button onClick={this.handleNoVideoClick}>No video</button>
              </p>
            </div>
          )}
        </div>
        <h4>Remaining for tab nav</h4>
        <ul>
          <li>Avoid hiding the controls</li>
          <li>Conflict for space/enter and play/pause</li>
          <li>Code cleanup</li>
          <li>Can keyboard shortcuts simply replace tab nav?</li>
        </ul>
        <Persist name="app-state" data={this.state} onMount={data => this.setState(data)} />
      </div>
    );
  }
}

export default App;
