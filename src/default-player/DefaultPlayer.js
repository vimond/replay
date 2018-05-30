// @flow
import * as React from 'react';
import PlayerController from '../components/player/PlayerController';
import VimondVideoStreamer from '../components/player/VideoStreamer/VimondVideoStreamer';

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
import QualitySelector, { type QualitySelectionStrategy } from '../components/controls/QualitySelector';
import GotoLiveButton from '../components/controls/GotoLiveButton';
import PlaybackMonitor from '../components/controls/PlaybackMonitor';

import graphics from './default-skin/defaultSkin';
import { labels } from './strings';

import type {
  PlaybackSource,
  SourceTrack,
  VideoStreamerConfiguration
} from '../components/player/VideoStreamer/common';
import type { RenderMethod } from '../components/player/PlayerController';
import type { KeyboardShortcutsConfiguration } from '../components/player/containment-helpers/KeyboardShortcuts';
import type { InteractionDetectorConfiguration } from '../components/player/containment-helpers/InteractionDetector';

// In this file, all custom parts making up a player can be assembled and "composed".

type ControlNames =
  | 'playPauseButton'
  | 'skipButton'
  | 'timeline'
  | 'timeDisplay'
  | 'gotoLiveButton'
  | 'volume'
  | 'audioSelector'
  | 'subtitlesSelector'
  | 'qualitySelector'
  | 'fullscreenButton'
  | 'bufferingIndicator';

export type PlayerConfiguration = {
  videoStreamer?: VideoStreamerConfiguration,
  interactionDetector?: InteractionDetectorConfiguration,
  keyboardShortcuts?: KeyboardShortcutsConfiguration,
  ui?: {
    classNamePrefix?: string, // Not implemented.
    includeControls?: Array<ControlNames>, // Not implemented.
    skipButtonOffset?: number,
    qualitySelectionStrategy?: QualitySelectionStrategy
  }
};

type DefaultPlayerProps = {
  source: PlaybackSource,
  textTracks: Array<SourceTrack>,
  options: PlayerConfiguration
};

const baseConfiguration = {
  keyboardShortcuts: {
    keyCodes: {
      togglePause: [32, 13],
      toggleFullscreen: 70,
      decreaseVolume: [109, 189],
      increaseVolume: [107, 187],
      skipBack: 188,
      skipForward: 190,
      toggleMute: 77
    }
  },
  videoStreamer: {},
  ui: {
    skipButtonOffset: -10,
    qualitySelectionStrategy: 'cap-bitrate'
  },
  playbackMonitor: {
    startVisible: true
  }
};

const bufferingRenderStrategy = 'always';
const liveDisplayMode = 'clock-time';

const getSkipBackOffset = (configuration: PlayerConfiguration) => {
  return configuration && configuration.ui && configuration.ui.skipButtonOffset;
};

const getQualitySelectionStrategy = (configuration: PlayerConfiguration) => {
  return configuration && configuration.ui && configuration.ui.qualitySelectionStrategy;
};

// Exporting for static design work.
export const renderPlayerUI: RenderMethod = ({ children, videoStreamState, mergedConfiguration }) => (
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
        <ControlsBar>
          <PlayPauseButton {...videoStreamState} {...labels.playPause} {...graphics.playPause} />
          <SkipButton
            {...videoStreamState}
            {...labels.skipBack}
            {...graphics.skipBack}
            offset={getSkipBackOffset(mergedConfiguration)}
          />
          <Timeline {...videoStreamState} {...labels.timeline} {...graphics.timeline} />
          <TimeDisplay liveDisplayMode={liveDisplayMode} {...videoStreamState} {...labels.timeDisplay} />
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
        <BufferingIndicator
          {...videoStreamState}
          {...labels.bufferingIndicator}
          {...graphics.bufferingIndicator}
          renderStrategy={bufferingRenderStrategy}
        />
      </React.Fragment>
    )}
  />
);

// This is the component to be consumed in a full React SPA.
const DefaultPlayer = ({ source, textTracks, options }: DefaultPlayerProps) => (
  // Can use spread for source&textTracks
  <PlayerController render={renderPlayerUI} configuration={baseConfiguration} options={options}>
    <VimondVideoStreamer source={source} textTracks={textTracks} />
  </PlayerController>
);
export default DefaultPlayer;
