// @flow
import * as React from 'react';
import type { RenderMethod } from '../components/player/PlayerController/PlayerController';
import type {
  GraphicAndStringResources,
  GraphicResources,
  PlayerConfiguration,
  StringResources,
  UIResources
} from './types';
import { defaultClassNamePrefix } from '../components/common';

// Non-connected controls
import ControlsBar from '../components/controls/ControlsBar/ControlsBar';
import FullscreenButton from '../components/controls/FullscreenButton/FullscreenButton';
import ExitButton from '../components/controls/ExitButton/ExitButton';

// Connected controls
import PlaybackMonitor from '../components/controls/PlaybackMonitor/PlaybackMonitor';
import {
  BufferingIndicator,
  GotoLiveButton,
  PlayerUIContainer,
  PlayPauseButton,
  QualitySelector,
  SettingsStorage,
  SkipButton,
  TimeDisplay,
  TimelineInformation,
  Timeline,
  PipButton,
  AirPlayButton
} from '../components/player/PlayerController/connectedControls';
import { ControlledVideoStreamer } from '../components/player/PlayerController/connectControl';
import RenderIfEnabled from '../components/player/RenderIfEnabled';
import PreferredSettingsApplicator from '../components/player/settings-helpers/PreferredSettingsApplicator';

const { AudioSelector, SubtitlesSelector, Volume } = SettingsStorage;
const getSkipBackOffset = (conf: PlayerConfiguration) => conf && conf.controls && conf.controls.skipButtonOffset;
const getLiveDisplayMode = (conf: PlayerConfiguration) => conf && conf.controls && conf.controls.liveDisplayMode;
const getQSStrategy = (conf: PlayerConfiguration) => conf && conf.controls && conf.controls.qualitySelectionStrategy;

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

const merge = (
  strings: UIResources<StringResources>,
  graphics: UIResources<GraphicResources>
): UIResources<GraphicAndStringResources> => {
  const merged = {};
  Object.entries(strings).forEach(([control, props]) => {
    merged[control] = { ...merged[control], ...props };
  });
  Object.entries(graphics).forEach(([control, props]) => {
    merged[control] = { ...merged[control], ...props };
  });
  return merged;
};

// The following method is assembling all controls into the player UI. Create a copy for assembling custom player UIs.

const getPlayerUIRenderer = (
  graphics: UIResources<GraphicResources>,
  strings: UIResources<StringResources>,
  classNamePrefix?: string = defaultClassNamePrefix
) => {
  const u = merge(strings, graphics);
  const renderPlayerUI: RenderMethod = ({ configuration, externalProps }) => {
    const prefix = { classNamePrefix: (configuration && configuration.classNamePrefix) || classNamePrefix };
    const includedControlsList = configuration.controls && configuration.controls.includeControls;
    return (
      <PlayerUIContainer
        configuration={configuration}
        {...prefix}
        render={({ fullscreenState }) => (
          <>
            <ControlledVideoStreamer {...prefix} />
            <RenderIfEnabled configuration={includedControlsList}>
              <ExitButton {...u.exitButton} {...prefix} onClick={externalProps && externalProps.onExit} />
              <PlaybackMonitor {...u.playbackMonitor} configuration={configuration} />
            </RenderIfEnabled>
            <ControlsBar {...prefix}>
              <RenderIfEnabled configuration={includedControlsList}>
                <PlayPauseButton {...u.playPauseButton} {...prefix} />
                <SkipButton {...u.skipButton} {...prefix} offset={getSkipBackOffset(configuration)} />
                <Timeline {...u.timeline} {...prefix}>
                  <TimelineInformation {...prefix} />
                </Timeline>
                <TimeDisplay {...u.timeDisplay} {...prefix} liveDisplayMode={getLiveDisplayMode(configuration)} />
                <GotoLiveButton {...u.gotoLiveButton} {...prefix} />
                <Volume {...u.volume} {...prefix} configuration={configuration} />
                <AudioSelector {...u.audioSelector} {...prefix} configuration={configuration} />
                <SubtitlesSelector {...u.subtitlesSelector} {...prefix} configuration={configuration} />
                <QualitySelector {...u.qualitySelector} {...prefix} selectionStrategy={getQSStrategy(configuration)} />
                <PipButton {...u.pipButton} {...prefix} />
                <AirPlayButton {...u.airPlayButton} {...prefix} />
                <FullscreenButton {...u.fullscreenButton} {...prefix} {...fullscreenState} />
              </RenderIfEnabled>
            </ControlsBar>
            <BufferingIndicator {...u.bufferingIndicator} {...prefix} />
            <PreferredSettingsApplicator configuration={configuration} {...externalProps.initialPlaybackProps} />
          </>
        )}
      />
    );
  };
  return renderPlayerUI;
};

export default getPlayerUIRenderer;
