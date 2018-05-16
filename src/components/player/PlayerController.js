// @flow
import * as React from 'react';
import type { VideoStreamState, VideoStreamProps, PlaybackMethods } from './VideoStream/common';
import { override } from '../common';

type UpdateProperty = (property: VideoStreamState) => void;

export type RenderData = {
	children: React.Node,
	videoStreamState: VideoStreamState,
	videoStreamProps: VideoStreamProps,
	updateProperty: UpdateProperty,
	gotoLive: () => {},
	setPosition: (value: number) => {}
};

export type RenderMethod = (RenderData) => React.Node;

type Props = {
	options?: any,
	configuration?: any,
	render: RenderMethod,
	children: React.Node
};

type State = VideoStreamState & {
	gotoLive: () => void,
	setPosition: (number) => void,
	updateProperty: UpdateProperty,
	videoStreamProps: VideoStreamProps
};

const passPropsToVideoStreamElement = (children: React.Node, props: any) => {
	return React.Children.map(children, (child, i) => {
		if (i === 0) {
			return React.cloneElement(child, props);
		} else {
			return child;
		}
	});
};

class PlayerController extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		const overriddenConfiguration = override(this.props.configuration, props.options) || {};
		this.state = {
			gotoLive: () => {},
			setPosition: () => {},
			updateProperty: this.updateProperty,
			videoStreamProps: {
				onReady: this.onVideoStreamReady,
				onStreamStateChange: this.onStreamStateChange,
				configuration: overriddenConfiguration.videoStreamer || overriddenConfiguration
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
		const videoStreamProps = { ...this.state.videoStreamProps, ...updatedProp };
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
			...videoStreamState
		} = this.state;

		const enhancedChildren = passPropsToVideoStreamElement(this.props.children, videoStreamProps);
		
		return this.props.render({
			children: enhancedChildren,
			videoStreamState: videoStreamState,
			gotoLive: videoStreamState.gotoLive,
			setPosition: videoStreamState.setPosition,
			updateProperty: this.updateProperty,
			videoStreamProps
		});
	}
}

export default PlayerController;
