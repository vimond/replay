// @flow
import * as React from 'react';
import type { VideoStreamState, VideoStreamerProps, PlaybackMethods } from './VideoStreamer/common';
import { override } from '../common';

type UpdateProperty = (property: VideoStreamState) => void;

export type RenderData = {
  children: React.Node,
  mergedConfiguration: any,
  videoStreamState: VideoStreamState,
  videoStreamerProps: VideoStreamerProps,
  updateProperty: UpdateProperty,
  gotoLive: () => {},
  setPosition: (value: number) => {}
};

export type RenderMethod = RenderData => React.Node;

type Props = {
  options?: any,
  configuration?: any,
  render: RenderMethod,
  children: React.Node
};

type State = VideoStreamState & {
  gotoLive: () => void,
  setPosition: number => void,
  updateProperty: UpdateProperty,
  videoStreamerProps: VideoStreamerProps
};

const passPropsToVideoStreamer = (children: React.Node, props: any) => {
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
    const mergedConfiguration = override(this.props.configuration, props.options) || {};
    this.state = {
      gotoLive: () => {},
      setPosition: () => {},
      updateProperty: this.updateProperty,
      mergedConfiguration,
      videoStreamerProps: {
        onReady: this.onVideoStreamerReady,
        onStreamStateChange: this.onStreamStateChange,
        configuration: mergedConfiguration.videoStreamer || mergedConfiguration
        // TODO: Consider making the config merging part of the DefaultPlayer composition.
      }
    };
  }

  onVideoStreamerReady = (methods: PlaybackMethods) => {
    this.setState({
      gotoLive: methods.gotoLive,
      setPosition: methods.setPosition
    });
  };

  // Video stream -> UI
  onStreamStateChange = (property: VideoStreamState) => {
    this.setState(property);
  };

  // UI -> video stream
  updateProperty = (updatedProp: VideoStreamerProps) => {
    const videoStreamerProps = { ...this.state.videoStreamerProps, ...updatedProp };
    this.setState({
      videoStreamerProps
    });
  };

  // TODO: shouldComponentUpdate() {
  //
  // }

  render() {
    const { videoStreamerProps, mergedConfiguration, ...videoStreamState } = this.state;

    const enhancedChildren = passPropsToVideoStreamer(this.props.children, videoStreamerProps);

    return this.props.render({
      children: enhancedChildren,
      mergedConfiguration,
      videoStreamState,
      gotoLive: videoStreamState.gotoLive,
      setPosition: videoStreamState.setPosition,
      updateProperty: this.updateProperty,
      videoStreamerProps
    });
  }
}

export default PlayerController;
