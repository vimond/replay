//@flow
import React, { Component } from 'react';
import { Persist } from 'react-persist';
import memoize from 'memoize-one';
import MockPlayer from './replay/default-player/MockPlayer';
import { Replay } from './replay/';
import PremiumVideoStreamer from 'vimond-videostreamer-premium';
import { defaultClassNamePrefix } from './replay/components/common';
import type { PlayerConfiguration } from './replay/default-player/types';
import './App.css';
import './replay/replay-default.css';

type State = {
  useMock?: boolean,
  streamUrl: string,
  alwaysShowDesignControls: boolean
};

const streamUrl1 =
  'https://tv2-hls-od.telenorcdn.net/dashvod15/_definst_/amlst:1346048_ps3120_pd412370.smil/manifest.mpd';
//const streamUrl2 = 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd';
//const streamUrl3 = 'https://tv2-hls-od.telenorcdn.net/dashvod15/_definst_/amlst:1359479_ps2064_pd186923.smil/manifest.mpd';

const getSource = memoize(streamUrl => {
  if (streamUrl) {
    return {
      playbackTechnology: 'dash',
      streamUrl
    };
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
      streamUrl: streamUrl1
    };
    window.setState = stateProps => this.setState(stateProps);
  }

  togglePlayer = () => this.setState({ useMock: !this.state.useMock });

  toggleShowDesignControls = () => this.setState({ alwaysShowDesignControls: !this.state.alwaysShowDesignControls });

  handleStreamUrlFieldChange = (evt: SyntheticEvent<HTMLInputElement>) =>
    this.setState({ streamUrl: evt.currentTarget.value });

  render() {
    const {
      alwaysShowDesignControls,
      streamUrl,
      useMock
    } = this.state;
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
              >
                <PremiumVideoStreamer className="videoStreamer" classNamePrefix={defaultClassNamePrefix} />
              </Replay>
              <input type="url" value={streamUrl} onChange={this.handleStreamUrlFieldChange} />
            </div>
          )}
        </div>
        <Persist name="app-state" data={this.state} onMount={data => this.setState(data)} />
      </div>
    );
  }
}

export default App;
