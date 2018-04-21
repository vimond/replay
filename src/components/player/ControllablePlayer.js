// @flow
import * as React from 'react';
import type { PlaybackState, VideoStreamProps, PlaybackSource, PlaybackMethods } from './VideoStream/common';
import { override } from '../common';

type UpdateProperty = (property: PlaybackState) => void;

export type RenderData = {
	playbackState: PlaybackState,
	videoStreamProps: VideoStreamProps,
	updateProperty: UpdateProperty,
	gotoLive: () => {},
	setPosition: (value: number) => {}
};

export type RenderMethod = (RenderData) => React.Node

type Props = {
	configuration: {},
	options?: ?{},
	render: RenderMethod
};

type State = PlaybackState & {
	gotoLive: () => void,
	setPosition: (number) => void,
	updateProperty: UpdateProperty,
	videoStreamProps: VideoStreamProps
};

class ControllablePlayer extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		// TODO: Compute full configuration.
		const overriddenConfiguration = override(props.configuration, props.options);
		this.state = {
			gotoLive: () => {},
			setPosition: () => {},
			updateProperty: this.updateProperty,
			videoStreamProps: {
				onReady: this.onVideoStreamReady,
				onPlaybackStateChange: this.onPlaybackStateChange,
				configuration: overriddenConfiguration
			}
		};
	}

	onVideoStreamReady = (methods: PlaybackMethods) => {
		this.setState({
			gotoLive: methods.gotoLive,
			setPosition: methods.setPosition,
		});
	};
		
	// Video stream -> UI
	onPlaybackStateChange = (property: PlaybackState) => {
		this.setState(property);
	};
	
	// UI -> video stream
	updateProperty = (updatedProp: VideoStreamProps) => {
		const videoStreamProps = { ...updatedProp, ...this.state.videoStreamProps};
		this.setState({
			videoStreamProps
		});
	};
	
	// TODO: shouldComponentUpdate() {
	//
	// }
	
	render() {
		const {
			videoStreamProps,
			...uiApi
		} = this.state;
		
		return this.props.render({ 
			playbackState: uiApi,
			gotoLive: uiApi.gotoLive, 
			setPosition: uiApi.setPosition, 
			updateProperty: this.updateProperty,
			videoStreamProps
		});
	}
}

export default ControllablePlayer;
