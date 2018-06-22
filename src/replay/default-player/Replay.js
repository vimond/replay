// @flow
import * as React from 'react';
import PlayerController from '../components/player/player-controller/PlayerController';
import BasicVideoStreamer from '../components/player/VideoStreamer/BasicVideoStreamer';
import connectControl, { ControlledVideoStreamer } from '../components/player/player-controller/connectControl';

import ControlsBar from '../components/controls/ControlsBar';
import { getConnectedPlayerUiContainer } from '../components/player/PlayerUiContainer';
import UnconnectedBufferingIndicator from '../components/controls/BufferingIndicator';
import UnconnectedPlayPauseButton from '../components/controls/PlayPauseButton';
import UnconnectedSkipButton from '../components/controls/SkipButton';
import UnconnectedTimeline from '../components/controls/Timeline';
import UnconnectedTimeDisplay from '../components/controls/TimeDisplay';
import UnconnectedVolume from '../components/controls/Volume';
import FullscreenButton from '../components/controls/FullscreenButton';
import UnconnectedAudioSelector from '../components/controls/AudioSelector';
import UnconnectedSubtitlesSelector from '../components/controls/SubtitlesSelector';
import UnconnectedQualitySelector from '../components/controls/QualitySelector';
import UnconnectedGotoLiveButton from '../components/controls/GotoLiveButton';
import ExitButton from '../components/controls/ExitButton';
// import PlaybackMonitor from '../components/controls/PlaybackMonitor';

import graphics from './default-skin/defaultSkin';
import { labels } from './strings';
import {
  baseConfiguration,
  getLiveDisplayMode,
  getQualitySelectionStrategy,
  getSkipBackOffset
} from './baseConfiguration';

import type { RenderMethod } from '../components/player/player-controller/PlayerController';
import type { ReplayProps } from './types';

// TODO: Separate into file.
const PlayerUiContainer = getConnectedPlayerUiContainer(connectControl);
const PlayPauseButton = connectControl(UnconnectedPlayPauseButton);
const SkipButton = connectControl(UnconnectedSkipButton);
const Timeline = connectControl(UnconnectedTimeline);
const TimeDisplay = connectControl(UnconnectedTimeDisplay);
const GotoLiveButton = connectControl(UnconnectedGotoLiveButton);
const Volume = connectControl(UnconnectedVolume);
const AudioSelector = connectControl(UnconnectedAudioSelector);
const SubtitlesSelector = connectControl(UnconnectedSubtitlesSelector);
const QualitySelector = connectControl(UnconnectedQualitySelector);
const BufferingIndicator = connectControl(UnconnectedBufferingIndicator);

// In this file, all custom parts making up a player can be assembled and "composed".

// Exporting for static design work.
export const renderPlayerUI: RenderMethod = ({ controllerApi, configuration, externalProps }) => (
  <PlayerUiContainer
    configuration={configuration}
    render={({ fullscreenState }) => (
      <React.Fragment>
        <ControlledVideoStreamer />
        {externalProps &&
          externalProps.onExit && (
            <ExitButton {...labels.exit} {...graphics.exitButton} onClick={externalProps.onExit} />
          )}
        <ControlsBar>
          <PlayPauseButton {...labels.playPause} {...graphics.playPause} />
          <SkipButton {...labels.skipBack} {...graphics.skipBack} offset={getSkipBackOffset(configuration)} />
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

// Should default to <BasicVideoStreamer /> when not specified.

const applyStreamer = (children, source, textTracks) =>
  children ? (
    React.cloneElement(children, { source, textTracks })
  ) : (
    <BasicVideoStreamer source={source} textTracks={textTracks} />
  );

// This is the component to be consumed in a full React SPA.
const Replay = ({ source, textTracks, options, onExit, onError, children }: ReplayProps) => (
  // Can use spread for source&textTracks
  <PlayerController
    render={renderPlayerUI}
    configuration={baseConfiguration}
    options={options}
    onStreamerError={onError}
    externalProps={{ onExit }}>
    {applyStreamer(children, source, textTracks)}
  </PlayerController>
);
export default Replay;
