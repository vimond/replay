// @flow
import * as React from 'react';
import ToggleButton from '../../generic/ToggleButton/ToggleButton';
import { defaultClassNamePrefix } from '../../common';
import type { CommonProps } from '../../common';

type Props = CommonProps & {
  /** The current fullscreen state, as reported in the render method of the Fullscreen helper component. */
  isFullscreen?: boolean,
  /** Intended for the setProperties method passed in the render method of the Fullscreen helper component. When the button is clicked, this callback is invoked with an object having an isFullscreen property with the opposite boolean value as the isFullscreen prop. */
  setProperties?: ({ isFullscreen: boolean }) => void,
  /** The button content to be displayed while isFullscreen is true. */
  fullscreenContent: React.Node,
  /** The button content to be displayed while isFullscreen is false. */
  normalContent: React.Node
};

const className = 'fullscreen-button';

class FullscreenButton extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };

  handleToggle = (value: boolean) => {
    if (this.props.setProperties) {
      this.props.setProperties({ isFullscreen: value });
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
