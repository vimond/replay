import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

import MockPlayer from './default-player/MockPlayer';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-player-panel">
          <MockPlayer />
        </div>
      </div>
    );
  }
}

export default App;
