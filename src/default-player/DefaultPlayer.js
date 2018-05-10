// @flow
import * as React from 'react';
import PlayerController from "../components/player/PlayerController";
import BasicVideoStream from "../components/player/VideoStream/BasicVideoStream";
import ControlsBar from '../components/controls/ControlsBar';
import PlayerUiContainer from '../components/player/PlayerUiContainer';
import Poster from '../components/controls/Poster';
import BufferingIndicator from '../components/controls/BufferingIndicator';
import PlayPauseButton from '../components/controls/PlayPauseButton';
import SkipButton from '../components/controls/SkipButton';
import Timeline from '../components/controls/Timeline';
//import GotoLiveButton from '../components/controls/GotoLiveButton';
import TimeDisplay from '../components/controls/TimeDisplay';
import Volume from '../components/controls/Volume';
//import AudioSelector from '../components/controls/AudioSelector';
//import SubtitlesSelector from '../components/controls/SubtitlesSelector';
//import QualitySelector from '../components/controls/QualitySelector';
import FullscreenButton from '../components/controls/FullscreenButton';
import type { PlaybackSource, SourceTrack } from '../components/player/VideoStream/common';
import type { RenderMethod } from '../components/player/PlayerController';

// In this file, all custom parts making up a player can be assembled and "composed".

type DefaultPlayerProps = {
	source: PlaybackSource, 
	textTracks: Array<SourceTrack>, 
	options: any
};

const configuration = {};
const labels = { // TODO: Consider a two level typed structure passed with the second level passed into a labels={} attribute on each element.s
	skipback: 'Skip back 10 seconds',
	playpause: 'Toggle play/pause',
	timedisplay: 'Video times',
	clocktimedisplay: 'Clock time',
	positiondisplay: 'Current time',
	durationdisplay: 'Duration',
	volume: 'Volume and mute',
	muteToggle: 'Toggle mute',
	volumeSlider: 'Volume setting',
	fullscreen: 'Fullscreen'
};
const graphics = {
	pause: 'Pa',
	play: 'Pl',
	skipback: '<-',
	unmuted: 'A',
	muted: 'M',
	volumeHandle: '•',
	enterfullscreen: '<>',
	exitfullsreen: '><'
};

// For static design work.
export const renderPlayerUI: RenderMethod = ({ children, videoStreamState, videoStreamProps }) => (
	<PlayerUiContainer>
		{children}
		<ControlsBar>
			<PlayPauseButton {...videoStreamState} playingContent={graphics.pause} pausedContent={graphics.play} />
			<SkipButton {...videoStreamState} label={labels.skipback} content={graphics.skipback} offset={-10} />
			<Timeline />
			<TimeDisplay liveDisplayMode="clock-time" {...videoStreamState} label={labels.timedisplay} clockTimeLabel={labels.clocktimedisplay} positionLabel={labels.positiondisplay} durationLabel={labels.durationdisplay} />
			<Volume {...videoStreamState} label={labels.volume} volumeSliderLabel={labels.volumeSlider} muteToggleLabel={labels.muteToggle} mutedContent={graphics.muted} unmutedContent={graphics.unmuted} volumeSliderHandleContent={graphics.volumeHandle} />
			<FullscreenButton isFullscreen={false} label={labels.fullscreen} normalContent={graphics.enterfullscreen} fullscreenContent={graphics.exitfullsreen}/>
		</ControlsBar>
		<Poster/>
		<BufferingIndicator/>
	</PlayerUiContainer>
);

//TODO: How about GotoLiveButton, SubtitlesSelector?

const DefaultPlayer = ({ source, textTracks, options } : DefaultPlayerProps) => ( // Can use spread for source&textTracks
	<PlayerController render={renderPlayerUI} configuration={configuration} options={options}>
		<BasicVideoStream source={source} textTracks={textTracks} />
	</PlayerController>
);
export default DefaultPlayer;