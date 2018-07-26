// @flow
import * as React from 'react';

import type { PlaybackSource, SourceTrack, VideoStreamerProps } from './components/player/VideoStreamer/types';
import type { RenderMethod } from './components/player/PlayerController/PlayerController';
import type { ReplayProps } from './default-player/types';
import PlayerController from './components/player/PlayerController/PlayerController';
import { baseConfiguration } from './default-player/baseConfiguration';
import type { GraphicResources, StringResources, UIResources } from './default-player/types';
import getPlayerUIRenderer from './default-player/playerUI';
import { defaultClassNamePrefix } from './components/common';

export type ResolveVideoStreamerMethod = (Component: ?React.ComponentType<VideoStreamerProps>, children: ?React.Element<any>, source?: ?PlaybackSource, textTracks?: ?Array<SourceTrack>) => ?React.Element<any>;

type Customization = {
  name?: string,
  configuration?: any,
  graphics?: UIResources<GraphicResources>,
  strings?: UIResources<StringResources>,
  classNamePrefix?: string,
  uiRenderMethod?: RenderMethod,
  resolveVideoStreamerMethod?: ResolveVideoStreamerMethod,
  // future: styles: { [string]: any },
  VideoStreamerComponent?: React.ComponentType<VideoStreamerProps>
};

// In addition comes CSS.

const defaultVideoStreamerResolver: ResolveVideoStreamerMethod = (Component, children, source, textTracks) => {
  return Component ? (<Component source={source} textTracks={textTracks}/>) 
    : children != null ? React.cloneElement(children, { source, textTracks }) 
      : null;
};

const createCustomPlayer = ({
  name,
  VideoStreamerComponent,
  graphics,
  strings,
  uiRenderMethod,
  resolveVideoStreamerMethod = defaultVideoStreamerResolver,
  classNamePrefix = defaultClassNamePrefix,
  configuration = baseConfiguration
}: Customization): React.ComponentType<ReplayProps> => {
  const renderUI = uiRenderMethod || (graphics && strings && getPlayerUIRenderer(graphics, strings, classNamePrefix));
  if (!renderUI) {
    throw new Error(
      'Either a custom UI render method must be specified in the customization parameters, ' +
        'or graphics and strings must be specified for the default player UI renderer.'
    );
  }

  const ComposedPlayer = ({
    source,
    textTracks,
    options,
    onExit,
    onError,
    startMuted,
    startPaused,
    startVolume,
    maxBitrate,
    lockedBitrate,
    children
  }: ReplayProps) => (
    <PlayerController
      render={renderUI}
      configuration={configuration}
      options={options}
      onStreamerError={onError}
      startMuted={startMuted}
      startPaused={startPaused}
      startVolume={startVolume}
      maxBitrate={maxBitrate}
      lockedBitrate={lockedBitrate}
      externalProps={{ onExit }}>
      {resolveVideoStreamerMethod(VideoStreamerComponent, children, source, textTracks)}
    </PlayerController>
  );
  if (name) {
    ComposedPlayer.displayName = name;
  }
  return ComposedPlayer;
};

export default createCustomPlayer;
