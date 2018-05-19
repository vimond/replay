// @flow

import * as React from 'react';
import {
  enterFullscreen,
  exitFullscreen,
  getFullscreenElement,
  notifyFullscreenChange
} from './crossBrowserFullscreen';

export type FullscreenState = {
  isFullscreen: boolean,
  updateProperty: ({ isFullscreen: boolean }) => void,
  enterFullscreen: () => void,
  exitFullscreen: () => void
};

type FullscreenRenderParameters = FullscreenState & {
  onRef: (?HTMLElement) => void
};

type Props = {
  render: FullscreenRenderParameters => React.Node
};

type State = {
  isFullscreen: boolean
};

class Fullscreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isFullscreen: false };
    this.unsubscribe = notifyFullscreenChange(this.onFullscreenChange);
  }

  fullscreenTarget: ?HTMLElement;
  unsubscribe: () => void;

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  onRef = (element: ?HTMLElement) => {
    this.fullscreenTarget = element;
    this.setState({ isFullscreen: getFullscreenElement() === element });
  };

  onFullscreenChange = () => {
    const fullscreenElement = getFullscreenElement();
    this.setState({ isFullscreen: !!(fullscreenElement && fullscreenElement === this.fullscreenTarget) });
  };

  enterFullscreen = () => {
    if (this.fullscreenTarget) {
      enterFullscreen(this.fullscreenTarget);
    }
  };

  exitFullscreen = () => {
    if (this.fullscreenTarget) {
      exitFullscreen(this.fullscreenTarget);
    }
  };

  updateProperty = ({ isFullscreen }: { isFullscreen: boolean } = {}) => {
    if (isFullscreen) {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
    }
  };

  render() {
    const { render } = this.props;
    const { isFullscreen } = this.state;
    const { enterFullscreen, exitFullscreen, onRef, updateProperty } = this;
    return render({ isFullscreen, enterFullscreen, exitFullscreen, updateProperty, onRef });
  }
}
export default Fullscreen;
