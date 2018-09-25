import React from 'react';
import { ScopeProvider } from '@compositor/x0/components';
import { SidebarLayout } from '@compositor/x0/components';

import MockVideoStreamer from '../src/replay/components/player/VideoStreamer/MockVideoStreamer';
import BasicVideoStreamer from '../src/replay/components/player/VideoStreamer/BasicVideoStreamer/BasicVideoStreamer';
import graphics from '../src/replay/default-player/default-skin/graphics';
import strings from '../src/replay/default-player/strings';
import { Replay } from '../src/replay/';
import '../src/replay/replay-default.css';
import '../src/App.css';
import createCustomPlayer from '../src/replay/customizer';
import PlayerController from '../src/replay/components/player/PlayerController/PlayerController';

import ControlsBar from '../src/replay/components/controls/ControlsBar/ControlsBar';
import FullscreenButton from '../src/replay/components/controls/FullscreenButton/FullscreenButton';
import ExitButton from '../src/replay/components/controls/ExitButton/ExitButton';
import PlaybackMonitor from '../src/replay/components/controls/PlaybackMonitor/PlaybackMonitor';
import * as connectedControls from '../src/replay/components/player/PlayerController/connectedControls';
import { ControlledVideoStreamer } from '../src/replay/components/player/PlayerController/connectControl';
import { defaultClassNamePrefix } from '../src/replay/components/common';
import { baseConfiguration } from '../src/replay/default-player/baseConfiguration';
import connectControl from '../src/replay/components/player/PlayerController/connectControl';

const components = {
  ControlsBar,
  FullscreenButton,
  ExitButton,
  PlaybackMonitor,
  ControlledVideoStreamer
};

const routeNames = {
  index: { name: 'Start page', priority: 1 },
  insert: { name: 'Player insertion and usage', priority: 2 },
  customize: { name: 'Customising the player', priority: 3 },
  'technical-topics': { priority: 4 },
  'architecture-patterns': { name: 'Architecture and patterns', priority: 5 },
  background: { priority: 6 },
  'inner-workings-guide': { priority: 0 },
  'tech-notes': { priority: 0 }
};

const processRoutes = routes =>
  routes
    .filter(route => !routeNames[route.name] || routeNames[route.name].priority > 0)
    .map(route => {
      if (!routeNames[route.name]) return route;
      return {
        ...route,
        name: routeNames[route.name].name || route.name,
        priority: routeNames[route.name].priority
      };
    })
    .sort((a, b) => ((a && a.priority) || 255) - ((b && b.priority) || 255));

const classNamePrefix = defaultClassNamePrefix;

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

const MyPlayPauseOverlay = connectControl(
  ({ isPaused, setProperty }) => (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor: 'pointer'
      }}
      onClick={() => setProperty({ isPaused: !isPaused })}
    />
  ),
  ['isPaused']
);

export default props => (
  <ScopeProvider
    scope={{
      ...connectedControls,
      ...components,
      baseConfiguration,
      MockVideoStreamer,
      BasicVideoStreamer,
      PlayerController,
      Replay,
      graphics,
      strings,
      classNamePrefix,
      MyCustomPlayer,
      MyPlayPauseOverlay
    }}>
    <SidebarLayout {...props} routes={processRoutes(props.routes)} />
  </ScopeProvider>
);
