import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

//import MockPlayer from './default-player/MockPlayer';
import DefaultPlayer from './replay/default-player/DefaultPlayer';

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
          <DefaultPlayer source={source} options={configOverrides} />
        </div>
      </div>
    );
  }
}

export default App;
