import React from 'react';
import { ScopeProvider } from '@compositor/x0/components';
import { SidebarLayout } from '@compositor/x0/components'

import MockVideoStreamer from '../src/replay/components/player/VideoStreamer/MockVideoStreamer';
import { Replay } from '../src/replay/';
import '../src/replay/replay-default.css';
import '../src/App.css';

const routeNames = {
  'insert': 'Player insertion and usage',
  'architecture-design': 'Architecture and design',
  'customize': 'Creating customised players',
  'inner-workings-guide': 'excluded',
  'tech-notes': 'excluded'
};

const processRoutes = routes => routes.filter(route => routeNames[route.name] !== 'excluded').map(route => {
  if (!routeNames[route.name]) return route;
  return {
    ...route,
    name: routeNames[route.name]
  }
});

export default props =>
  <ScopeProvider scope={{ MockVideoStreamer, Replay }}>
    <SidebarLayout {...props} routes={processRoutes(props.routes)}/>
  </ScopeProvider>;