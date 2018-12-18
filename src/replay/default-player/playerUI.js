// @flow
import * as React from 'react';
import type { RenderMethod } from '../components/player/PlayerController/PlayerController';
import type { GraphicResources, PlayerConfiguration, StringResources, UIResources } from './types';
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
const getSkipBackOffset = (conf: PlayerConfiguration) => conf && conf.ui && conf.ui.skipButtonOffset;
const getLiveDisplayMode = (conf: PlayerConfiguration) => conf && conf.ui && conf.ui.liveDisplayMode;
const getQualitySelectionStrategy = (conf: PlayerConfiguration) => conf && conf.ui && conf.ui.qualitySelectionStrategy;

// In this file, all custom parts making up a player UI are assembled. Create a copy for assembling custom player UIs.

const getPlayerUIRenderer = (
  graphics: UIResources<GraphicResources>,
  strings: UIResources<StringResources>,
  classNamePrefix?: string = defaultClassNamePrefix
) => {
  const renderPlayerUI: RenderMethod = ({ configuration, externalProps }) => {
    const prefix = (configuration.ui && configuration.ui.classNamePrefix) || classNamePrefix;
    return (
      <PlayerUIContainer
        classNamePrefix={prefix}
        configuration={configuration}
        render={({ fullscreenState }) => (
          <React.Fragment>
            <ControlledVideoStreamer classNamePrefix={prefix} />
            <RenderIfEnabled configuration={configuration.ui && configuration.ui.includeControls}>
              {externalProps &&
                externalProps.onExit && (
                  <ExitButton
                    {...strings.exitButton}
                    {...graphics.exitButton}
                    onClick={externalProps.onExit}
                    classNamePrefix={prefix}
                  />
                )}
              <PlaybackMonitor
                configuration={configuration}
                closeButtonContent={graphics.playbackMonitor && graphics.playbackMonitor.closeButtonContent}
              />
            </RenderIfEnabled>
            <ControlsBar classNamePrefix={prefix}>
              <RenderIfEnabled configuration={configuration.ui && configuration.ui.includeControls}>
                <PlayPauseButton {...strings.playPauseButton} {...graphics.playPauseButton} classNamePrefix={prefix} />
                <SkipButton
                  offset={getSkipBackOffset(configuration)}
                  {...strings.skipButton}
                  {...graphics.skipButton}
                  classNamePrefix={prefix}
                />
                <Timeline {...strings.timeline} {...graphics.timeline} classNamePrefix={prefix}>
                  <TimelineInformation classNamePrefix={prefix} />
                </Timeline>
                <TimeDisplay
                  liveDisplayMode={getLiveDisplayMode(configuration)}
                  {...strings.timeDisplay}
                  classNamePrefix={prefix}
                />
                <GotoLiveButton {...strings.gotoLiveButton} {...graphics.gotoLiveButton} classNamePrefix={prefix} />
                <Volume
                  {...strings.volume}
                  {...graphics.volume}
                  configuration={configuration}
                  classNamePrefix={prefix}
                />
                <AudioSelector
                  {...strings.audioSelector}
                  {...graphics.audioSelector}
                  classNamePrefix={prefix}
                  configuration={configuration}
                />
                <SubtitlesSelector
                  {...strings.subtitlesSelector}
                  {...graphics.subtitlesSelector}
                  classNamePrefix={prefix}
                  configuration={configuration}
                />
                <QualitySelector
                  {...strings.qualitySelector}
                  {...graphics.qualitySelector}
                  selectionStrategy={getQualitySelectionStrategy(configuration)}
                  classNamePrefix={prefix}
                />
                <PipButton {...strings.pipButton} {...graphics.pipButton} classNamePrefix={prefix} />
                <AirPlayButton {...strings.airPlayButton} {...graphics.airPlayButton} classNamePrefix={prefix} />
                <FullscreenButton
                  {...fullscreenState}
                  {...strings.fullscreenButton}
                  {...graphics.fullscreenButton}
                  classNamePrefix={prefix}
                />
              </RenderIfEnabled>
            </ControlsBar>
            <BufferingIndicator
              {...strings.bufferingIndicator}
              {...graphics.bufferingIndicator}
              classNamePrefix={prefix}
            />
            <PreferredSettingsApplicator configuration={configuration} {...externalProps.initialPlaybackProps} />
          </React.Fragment>
        )}
      />
    );
  };
  return renderPlayerUI;
};

export default getPlayerUIRenderer;
