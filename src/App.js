import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

//import MockPlayer from './default-player/MockPlayer';
import { Replay } from './replay/';
import PremiumVideoStreamer from 'vimond-videostreamer-premium';
import { defaultClassNamePrefix } from './replay/components/common';
import './replay/replay-default.css';

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

class App extends Component {
  constructor() {
    super();
    this.state = {
      isOpen: true
    };
  }

  closePlayer = () => this.setState({ isOpen: false });

  render() {
    return (
      <div className="App">
        <div className="App-player-panel">
          {this.state.isOpen && (
            <Replay source={source} options={configOverrides} onExit={this.closePlayer}>
              <PremiumVideoStreamer className="videoStreamer" classNamePrefix={defaultClassNamePrefix} />
            </Replay>
          )}
        </div>
      </div>
    );
  }
}

export default App;
