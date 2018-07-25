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

const videoUrls = [
  'https://progressive-tv2-no.akamaized.net/ismusp/isi_mp4_0/2018-07-24/S_TRENERLYGING_240718_LA(1359781_R224MP41000).mp4',
  'https://progressive-tv2-no.akamaized.net/ismusp/isi_mp4_0/2018-07-20/N_ELGBADER_200718_SIKRO_(1359389_R212MP41000).mp4'
];

const getSource = memoize(streamUrl => {
  if (streamUrl) {
    return {
      playbackTechnology: 'html',
      streamUrl
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
              <MockPlayer options={getPlayerOptionsFromState(this.state)} onExit={this.togglePlayer}>
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
        <Persist name="app-state" data={this.state} onMount={data => this.setState(data)} />
      </div>
    );
  }
}

export default App;
