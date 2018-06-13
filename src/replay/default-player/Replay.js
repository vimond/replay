// @flow
import * as React from 'react';
import PlayerController from '../components/player/PlayerController';
import BasicVideoStreamer from '../components/player/VideoStreamer/BasicVideoStreamer';

import ControlsBar from '../components/controls/ControlsBar';
import PlayerUiContainer from '../components/player/PlayerUiContainer';
import BufferingIndicator from '../components/controls/BufferingIndicator';
import PlayPauseButton from '../components/controls/PlayPauseButton';
import SkipButton from '../components/controls/SkipButton';
import Timeline from '../components/controls/Timeline';
import TimeDisplay from '../components/controls/TimeDisplay';
import Volume from '../components/controls/Volume';
import FullscreenButton from '../components/controls/FullscreenButton';
import AudioSelector from '../components/controls/AudioSelector';
import SubtitlesSelector from '../components/controls/SubtitlesSelector';
import QualitySelector from '../components/controls/QualitySelector';
import GotoLiveButton from '../components/controls/GotoLiveButton';
import PlaybackMonitor from '../components/controls/PlaybackMonitor';

import graphics from './default-skin/defaultSkin';
import { labels } from './strings';
import {
  baseConfiguration,
  getLiveDisplayMode,
  getQualitySelectionStrategy,
  getSkipBackOffset
} from './baseConfiguration';

import type { RenderMethod } from '../components/player/PlayerController';
import type { ReplayProps } from './types';
import ExitButton from '../components/controls/ExitButton';

// In this file, all custom parts making up a player can be assembled and "composed".

// Exporting for static design work.
export const renderPlayerUI: RenderMethod = ({ children, videoStreamState, mergedConfiguration, externalProps }) => (
  <PlayerUiContainer
    configuration={mergedConfiguration}
    videoStreamState={videoStreamState}
    render={({ fullscreenState }) => (
      <React.Fragment>
        {children}
        <PlaybackMonitor
          videoStreamState={videoStreamState}
          configuration={mergedConfiguration}
          {...graphics.playbackMonitor}
        />
        {externalProps && externalProps.onExit && <ExitButton {...labels.exit} {...graphics.exitButton} onClick={externalProps.onExit} /> }
        <ControlsBar>
          <PlayPauseButton {...videoStreamState} {...labels.playPause} {...graphics.playPause} />
          <SkipButton
            {...videoStreamState}
            {...labels.skipBack}
            {...graphics.skipBack}
            offset={getSkipBackOffset(mergedConfiguration)}
          />
          <Timeline {...videoStreamState} {...labels.timeline} {...graphics.timeline} />
          <TimeDisplay
            liveDisplayMode={getLiveDisplayMode(mergedConfiguration)}
            {...videoStreamState}
            {...labels.timeDisplay}
          />
          <GotoLiveButton {...videoStreamState} {...labels.gotoLive} {...graphics.gotoLive} />
          <Volume {...videoStreamState} {...labels.volume} {...graphics.volume} />
          <AudioSelector {...videoStreamState} {...labels.audioSelector} {...graphics.audioSelector} />
          <SubtitlesSelector {...videoStreamState} {...labels.subtitlesSelector} {...graphics.subtitlesSelector} />
          <QualitySelector
            {...videoStreamState}
            {...labels.qualitySelector}
            {...graphics.qualitySelector}
            selectionStrategy={getQualitySelectionStrategy(mergedConfiguration)}
          />
          <FullscreenButton {...fullscreenState} {...labels.fullscreen} {...graphics.fullscreen} />
        </ControlsBar>
        <BufferingIndicator {...videoStreamState} {...labels.bufferingIndicator} {...graphics.bufferingIndicator} />
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
const Replay = ({ source, textTracks, options, onExit, children }: ReplayProps) => (
  // Can use spread for source&textTracks
  <PlayerController render={renderPlayerUI} configuration={baseConfiguration} options={options} renderProps={{ onExit }}>
    {applyStreamer(children, source, textTracks)}
  </PlayerController>
);
export default Replay;
