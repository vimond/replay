import React, { Component } from 'react';
import MockPlayer from '../src/replay/default-player/MockPlayer';
import { Replay } from '../src/replay/';
import { ScopeProvider } from '@compositor/x0/components'
import '../src/replay/replay-default.css';
import '../src/App.css';

export default props =>
  <div className="App-player-panel"><ScopeProvider scope={{ MockPlayer, Replay }}>
    {props.children}
  </ScopeProvider></div>;