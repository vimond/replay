// @flow
import * as React from 'react';
import type { VideoStreamState, VideoStreamProps, PlaybackSource, PlaybackMethods } from './VideoStream/common';
import { override } from '../common';

type UpdateProperty = (property: VideoStreamState) => void;

export type RenderData = {
	videoStreamState: VideoStreamState,
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

type State = VideoStreamState & {
	gotoLive: () => void,
	setPosition: (number) => void,
	updateProperty: UpdateProperty,
	videoStreamProps: VideoStreamProps
};

class ControllablePlayer extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		const overriddenConfiguration = override(props.configuration, props.options);
		this.state = {
			gotoLive: () => {},
			setPosition: () => {},
			updateProperty: this.updateProperty,
			videoStreamProps: {
				onReady: this.onVideoStreamReady,
				onStreamStateChange: this.onStreamStateChange,
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
	onStreamStateChange = (property: VideoStreamState) => {
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
			videoStreamState: uiApi,
			gotoLive: uiApi.gotoLive, 
			setPosition: uiApi.setPosition, 
			updateProperty: this.updateProperty,
			videoStreamProps
		});
	}
}

export default ControllablePlayer;
