// @flow
import * as React from 'react';
import ToggleButton from '../generic/ToggleButton';
import { defaultClassNamePrefix } from '../common';
import type { CommonProps } from '../common';

type Props = CommonProps & {
  isFullscreen?: boolean,
  updateProperty?: ({ isFullscreen: boolean }) => void,
  enterFullscreen: () => void,
  exitFullscreen: () => void,
  fullscreenContent: React.Node,
  normalContent: React.Node
};

const className = 'fullscreen-button';

class FullscreenButton extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };

  handleToggle = (value: boolean) => {
    if (this.props.updateProperty) {
      this.props.updateProperty({ isFullscreen: value });
    }
    if (value && this.props.enterFullscreen) {
      this.props.enterFullscreen();
    }
    if (!value && this.props.exitFullscreen) {
      this.props.exitFullscreen();
    }
  };

  render() {
    const { isFullscreen, fullscreenContent, normalContent, label, classNamePrefix } = this.props;
    return (
      <ToggleButton
        classNamePrefix={classNamePrefix}
        isOn={isFullscreen}
        className={className}
        label={label}
        onToggle={this.handleToggle}
        toggledOnContent={fullscreenContent}
        toggledOffContent={normalContent}
      />
    );
  }
}

export default FullscreenButton;
