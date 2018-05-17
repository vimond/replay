// @flow
import * as React from 'react';
import PlayerController from '../components/player/PlayerController';
import BasicVideoStream from '../components/player/VideoStream/BasicVideoStream';
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
import type { PlaybackSource, SourceTrack } from '../components/player/VideoStream/common';
import type { RenderMethod } from '../components/player/PlayerController';

import graphics from './default-skin/defaultSkin';
import { labels } from './strings';


// In this file, all custom parts making up a player can be assembled and "composed".

type DefaultPlayerProps = {
  source: PlaybackSource,
  textTracks: Array<SourceTrack>,
  options: any
};

const configuration = {};

const skipBackOffset = -10;
const qualityStrategy = 'cap-bitrate';
const liveDisplayMode = 'clock-time';


// Exporting for static design work.
export const renderPlayerUI: RenderMethod = ({ children, videoStreamState }) => (
  <PlayerUiContainer>
    {children}
    <ControlsBar>
      <PlayPauseButton {...videoStreamState} {...labels.playPause} {...graphics.playPause} />
      <SkipButton {...videoStreamState} {...labels.skipBack} {...graphics.skipBack} offset={skipBackOffset} />
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
        selectionStrategy={qualityStrategy}
      />
      <FullscreenButton isFullscreen={false} {...labels.fullscreen} {...graphics.fullscreen} />
    </ControlsBar>
    <BufferingIndicator {...videoStreamState} {...labels.bufferingIndicator} {...graphics.bufferingIndicator} />
  </PlayerUiContainer>
);

const DefaultPlayer = (
  { source, textTracks, options }: DefaultPlayerProps // Can use spread for source&textTracks
) => (
  <PlayerController render={renderPlayerUI} configuration={configuration} options={options}>
    <BasicVideoStream source={source} textTracks={textTracks} />
  </PlayerController>
);
export default DefaultPlayer;
