import * as React from 'react';

import { defaultClassNamePrefix } from '../../../components/common';

// Non-connected controls
import ControlsBar from '../../../components/controls/ControlsBar/ControlsBar';
import FullscreenButton from '../../../components/controls/FullscreenButton/FullscreenButton';
import ExitButton from '../../../components/controls/ExitButton/ExitButton';

// Connected controls
import PlaybackMonitor from '../../../components/controls/PlaybackMonitor/PlaybackMonitor';
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
} from '../../../components/player/PlayerController/connectedControls';
import connectControl, { ControlledVideoStreamer } from '../../../components/player/PlayerController/connectControl';
import PreferredSettingsApplicator from '../../../components/player/settings-helpers/PreferredSettingsApplicator';

const { AudioSelector, SubtitlesSelector, Volume } = SettingsStorage;
const getSkipBackOffset = conf => conf && conf.controls && conf.controls.skipButtonOffset;
const getLiveDisplayMode = conf => conf && conf.controls && conf.controls.liveDisplayMode;
const getQSStrategy = conf => conf && conf.controls && conf.controls.qualitySelectionStrategy;

import UnconnectedTitleOverlay from './TitleOverlay';
const TitleOverlay = connectControl(UnconnectedTitleOverlay, ['duration', 'isPaused']);

import graphics from '../../../default-player/default-skin/graphics';
import strings from '../../../default-player/strings';

const merge = (strings, graphics) => {
  const merged = {};
  Object.entries(strings).forEach(([control, props]) => {
    merged[control] = { ...merged[control], ...props };
  });
  Object.entries(graphics).forEach(([control, props]) => {
    merged[control] = { ...merged[control], ...props };
  });
  return merged;
};

const u = merge(strings, graphics);

const renderPlayerUI = ({ configuration, externalProps }) => {
  const prefix = { classNamePrefix: (configuration && configuration.classNamePrefix) || defaultClassNamePrefix };
  return (
    <PlayerUIContainer
      configuration={configuration}
      {...prefix}
      render={({ fullscreenState, interactionState }) => (
        <>
          <ControlledVideoStreamer {...prefix} />
          <ExitButton {...u.exitButton} {...prefix} onClick={externalProps && externalProps.onExit} />
          <PlaybackMonitor {...u.playbackMonitor} configuration={configuration} />

          <TitleOverlay title={externalProps.title} isUserActive={interactionState.isUserActive} />

          <ControlsBar {...prefix}>
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
          </ControlsBar>
          <BufferingIndicator {...u.bufferingIndicator} {...prefix} />
          <PreferredSettingsApplicator configuration={configuration} {...externalProps.initialPlaybackProps} />
        </>
      )}
    />
  );
};

export default renderPlayerUI;
