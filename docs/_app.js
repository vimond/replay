import React from 'react';
import { ScopeProvider } from '@compositor/x0/components';
import { SidebarLayout } from '@compositor/x0/components'

import MockVideoStreamer from '../src/replay/components/player/VideoStreamer/MockVideoStreamer';
import graphics from '../src/replay/default-player/default-skin/graphics';
import strings from '../src/replay/default-player/strings';
import { Replay } from '../src/replay/';
import '../src/replay/replay-default.css';
import '../src/App.css';
import createCustomPlayer from '../src/replay/customizer';

const routeNames = {
  'insert': 'Player insertion and usage',
  'architecture-design': 'Architecture and design',
  'customize': 'Customising the player',
  'inner-workings-guide': 'excluded',
  'tech-notes': 'excluded'
};

const myCustomGraphics = {
  ...graphics,
  playPauseButton: {
    playingContent: <em>Pa</em>,
    pausedContent: <em>Pl</em>
  }
};

const myCustomStrings = {
  ...strings,
  subtitlesSelector: {
    label: 'Captions',
    noSubtitlesLabel: 'No captions'
  }
};

const MyCustomPlayer = createCustomPlayer({
  name: 'MyCustomPlayer',
  graphics: myCustomGraphics,
  strings: myCustomStrings,
  videoStreamerComponent: MockVideoStreamer
});

const processRoutes = routes => routes.filter(route => routeNames[route.name] !== 'excluded').map(route => {
  if (!routeNames[route.name]) return route;
  return {
    ...route,
    name: routeNames[route.name]
  }
});

export default props =>
  <ScopeProvider scope={{ MockVideoStreamer, Replay, graphics, strings, MyCustomPlayer }}>
    <SidebarLayout {...props} routes={processRoutes(props.routes)}/>
  </ScopeProvider>;