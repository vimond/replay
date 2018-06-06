import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

//import MockPlayer from './default-player/MockPlayer';
import { Player } from './replay/';
import VimondVideoStreamer from './replay/components/player/VideoStreamer/VimondVideoStreamer';

const source = {
  playbackTechnology: 'dash',
  //streamUrl: 'https://ls3-hls-live.akamaized.net/out/u/nk.mpd'
  streamUrl: 'https://tv2-hls-od.telenorcdn.net/dashvod12/_definst_/amlst:1335254_ps1641_pd384214.smil/manifest.mpd'
};

const configOverrides = {
  videoStreamer: {
    dash: {
      shaka: {
        libraryUrl: ''
      }
    }
  }
};

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-player-panel">
          <Player source={source} options={configOverrides}><VimondVideoStreamer /></Player>
        </div>
      </div>
    );
  }
}

export default App;
