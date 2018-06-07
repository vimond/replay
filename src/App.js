import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

//import MockPlayer from './default-player/MockPlayer';
import { Player } from './replay/';
import PremiumVideoStreamer from 'vimond-videostreamer-premium';
import { defaultClassNamePrefix } from './replay/components/common';

const source = {
  playbackTechnology: 'dash',
  //streamUrl: 'https://ls3-hls-live.akamaized.net/out/u/nk.mpd'
  streamUrl: 'https://tv2-hls-od.telenorcdn.net/dashvod12/_definst_/amlst:1335254_ps1641_pd384214.smil/manifest.mpd'
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
            <Player source={source} options={configOverrides} onExit={this.closePlayer}>
              <PremiumVideoStreamer className="videoStreamer" classNamePrefix={defaultClassNamePrefix} />
            </Player>
          )}
        </div>
      </div>
    );
  }
}

export default App;
