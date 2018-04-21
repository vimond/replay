// @flow
import * as React from 'react';
import type { VideoStreamState, VideoStreamProps, PlaybackSource, PlaybackMethods, SourceTrack } from './VideoStream/common';
import { override } from '../common';

type UpdateProperty = (property: VideoStreamState) => void;

export type RenderData = {
	videoStreamState: VideoStreamState,
	videoStreamProps: VideoStreamProps,
	updateProperty: UpdateProperty,
	gotoLive: () => {},
	setPosition: (value: number) => {}
};

export type RenderMethod = (React.ComponentType<VideoStreamProps>, RenderData) => React.Node

type Props = {
	options?: ?{},
	source?: ?PlaybackSource,
	textTracks?: ?Array<SourceTrack>,
	render: RenderMethod
};

type State = VideoStreamState & {
	gotoLive: () => void,
	setPosition: (number) => void,
	updateProperty: UpdateProperty,
	videoStreamProps: VideoStreamProps
};

const withProps = (Comp: React.ComponentType<{}>, injectedProps: any) => {
	return props => <Comp {...injectedProps} {...props} />;
};

const withVideoStream = (VideoStreamComponent: React.ComponentType<VideoStreamProps>, configuration: any) => {
	return class ControllablePlayer extends React.Component<Props, State> {
		constructor(props: Props) {
			super(props);
			const overriddenConfiguration = override(configuration, props.options);
			this.state = {
				gotoLive: () => {},
				setPosition: () => {},
				updateProperty: this.updateProperty,
				videoStreamProps: {
					source: this.props.source,
					textTracks: this.props.textTracks,
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

			const videoStreamComponentWithProps = withProps(VideoStreamComponent, videoStreamProps);
			return this.props.render(videoStreamComponentWithProps, {
				videoStreamState: uiApi,
				gotoLive: uiApi.gotoLive,
				setPosition: uiApi.setPosition,
				updateProperty: this.updateProperty,
				videoStreamProps
			});
		}
	}
};

export default withVideoStream;
