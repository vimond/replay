//@flow

import React, { Component } from 'react';
import { Persist } from 'react-persist';
import MockPlayer from './replay/default-player/MockPlayer';
import './App.css';

import { Replay } from './replay/';
import PremiumVideoStreamer from 'vimond-videostreamer-premium';
import { defaultClassNamePrefix } from './replay/components/common';
import './replay/replay-default.css';

type State = {
  useMock?: boolean,
  alwaysShowDesignControls: boolean
};

const source = {
  playbackTechnology: 'dash',
  //streamUrl: 'https://ls3-hls-live.akamaized.net/out/u/nk.mpd'
  streamUrl: 'https://tv2-hls-od.telenorcdn.net/dashvod15/_definst_/amlst:1346048_ps3120_pd412370.smil/manifest.mpd'
};

const configOverrides = {
  videoStreamer: {
    dash: {
      //dashImpl: 'dashjs'
    }
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
      useMock: false,
      alwaysShowDesignControls: true
    };
  }

  togglePlayer = () => this.setState({ useMock: !this.state.useMock });

  toggleShowDesignControls = () => this.setState({ alwaysShowDesignControls: !this.state.alwaysShowDesignControls });

  render() {
    return (
      <div className="App">
        <div className="App-player-panel">
          {this.state.useMock ? (
            <Replay source={source} options={configOverrides} onExit={this.togglePlayer}>
              <PremiumVideoStreamer className="videoStreamer" classNamePrefix={defaultClassNamePrefix} />
            </Replay>
          ) : (
            <div>
              <MockPlayer options={getPlayerOptionsFromState(this.state)} onExit={this.togglePlayer}>Design mode</MockPlayer>
              <p>
                <input
                  id="toggleAlwaysShowControls"
                  checked={this.state.alwaysShowDesignControls}
                  type="checkbox"
                  onChange={this.toggleShowDesignControls}
                />
                <label htmlFor="toggleAlwaysShowControls">Never hide the controls bar.</label>
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
