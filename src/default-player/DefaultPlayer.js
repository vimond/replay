// @flow
import * as React from 'react';
import ControllablePlayer from "../components/player/ControllablePlayer";
import BasicVideoStream from "../components/player/BasicVideoStream";
import ControlsBar from '../components/player/ControlsBar';
import PlayerHost from '../components/player/PlayerHost';
import Poster from '../components/player/Poster';
import BufferingIndicator from '../components/player/BufferingIndicator';
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
import type { PlaybackSource } from '../components/player/VideoStream/common';
import type { RenderData, RenderMethod } from '../components/player/ControllablePlayer';

// In this file, all custom parts making up a player can be assembled and "composed".

const configuration = {};
const labels = {
	skipback: 'Skip back 10 seconds',
	playpause: 'Toggle play/pause'
};
const graphics = {
	pause: 'Pa',
	play: 'Pl',
	skipback: '<-'
};

// For static design work.
export const renderPlayerUI = (source: PlaybackSource, { videoStreamState, setPosition, gotoLive, updateProperty, videoStreamProps }: RenderData) => (
	<PlayerHost>
		<BasicVideoStream source={source} className="video-stream" {...videoStreamProps} />
		<ControlsBar>
			<PlayPauseButton playingContent={graphics.pause} pausedContent={graphics.play} {...videoStreamState} />
			<SkipButton label={labels.skipback} content={graphics.skipback} offset={-10} {...videoStreamState}/>
			<Timeline />
			<TimeDisplay/>
			<Volume/>
			<FullscreenButton/>
		</ControlsBar>
		<Poster/>
		<BufferingIndicator/>
	</PlayerHost>
);

const DefaultPlayer = (source: PlaybackSource, options: any) => {
	const render = renderData => renderPlayerUI(source, renderData); // In theory, this function should only be updated when the source changes (and options, but that's not expected).
	return (
		<ControllablePlayer configuration={configuration} options={options} render={render} />
	);
};

export default DefaultPlayer;