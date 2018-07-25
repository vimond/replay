// @flow
import * as React from 'react';
import type { RenderMethod } from '../components/player/PlayerController/PlayerController';
import { ControlledVideoStreamer } from '../components/player/PlayerController/connectControl';

import ControlsBar from '../components/controls/ControlsBar/ControlsBar';
import FullscreenButton from '../components/controls/FullscreenButton/FullscreenButton';
import ExitButton from '../components/controls/ExitButton/ExitButton';
import {
  AudioSelector,
  BufferingIndicator,
  GotoLiveButton,
  PlayerUIContainer,
  PlayPauseButton,
  QualitySelector,
  SkipButton,
  SubtitlesSelector,
  TimeDisplay,
  Timeline,
  Volume
} from '../components/player/PlayerController/connectedControls';

import PlaybackMonitor from '../components/controls/PlaybackMonitor/PlaybackMonitor';

import graphics from './default-skin/defaultSkin';
import { labels } from './strings';
import { getLiveDisplayMode, getQualitySelectionStrategy, getSkipBackOffset } from './baseConfiguration';

// In this file, all custom parts making up a player can be assembled and "composed".

const renderPlayerUI: RenderMethod = ({ configuration, externalProps }) => (
  <PlayerUIContainer
    configuration={configuration}
    render={({ fullscreenState }) => (
      <React.Fragment>
        <ControlledVideoStreamer />
        {externalProps &&
          externalProps.onExit && (
            <ExitButton {...labels.exit} {...graphics.exitButton} onClick={externalProps.onExit} />
          )}
        <PlaybackMonitor
          configuration={configuration}
          closeButtonContent={graphics.playbackMonitor.closeButtonContent}
        />
        <ControlsBar>
          <PlayPauseButton {...labels.playPause} {...graphics.playPause} />
          <SkipButton offset={getSkipBackOffset(configuration)} {...labels.skipBack} {...graphics.skipBack} />
          <Timeline {...labels.timeline} {...graphics.timeline} />
          <TimeDisplay liveDisplayMode={getLiveDisplayMode(configuration)} {...labels.timeDisplay} />
          <GotoLiveButton {...labels.gotoLive} {...graphics.gotoLive} />
          <Volume {...labels.volume} {...graphics.volume} />
          <AudioSelector {...labels.audioSelector} {...graphics.audioSelector} />
          <SubtitlesSelector {...labels.subtitlesSelector} {...graphics.subtitlesSelector} />
          <QualitySelector
            {...labels.qualitySelector}
            {...graphics.qualitySelector}
            selectionStrategy={getQualitySelectionStrategy(configuration)}
          />
          <FullscreenButton {...fullscreenState} {...labels.fullscreen} {...graphics.fullscreen} />
        </ControlsBar>
        <BufferingIndicator {...labels.bufferingIndicator} {...graphics.bufferingIndicator} />
      </React.Fragment>
    )}
  />
);

export default renderPlayerUI;
