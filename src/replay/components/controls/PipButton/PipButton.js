// @flow
import * as React from 'react';
import ToggleButton from '../../generic/ToggleButton/ToggleButton';
import { defaultClassNamePrefix } from '../../common';
import type { CommonProps } from '../../common';
import type { StreamStateKeysForObservation } from '../../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  /** If true, this button will be rendered. */
  isPipAvailable?: boolean,
  /** The current picture-in-picture state, as reported from a video streamer. */
  isPipActive?: boolean,
  /** Intended for the setProperties method passed from the player controller through connectControl(). When the button is clicked, this callback is invoked with an object having an isPipActive property with the opposite boolean value as the isPipActive prop. */
  setProperties?: ({ isPipActive: boolean }) => void,
  /** The button content to be displayed while isPipActive is true. */
  pipActiveContent: React.Node,
  /** The button content to be displayed while isPipActive is false. */
  pipInactiveContent: React.Node
};

const className = 'pip-button';

class PipButton extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };

  static streamStateKeysForObservation: StreamStateKeysForObservation = ['isPipAvailable', 'isPipActive'];

  handleToggle = (value: boolean) => {
    if (this.props.setProperties) {
      this.props.setProperties({ isPipActive: value });
    }
  };

  render() {
    if (this.props.isPipAvailable) {
      const { isPipActive, pipActiveContent, pipInactiveContent, label, classNamePrefix } = this.props;
      return (
        <ToggleButton
          classNamePrefix={classNamePrefix}
          isOn={isPipActive}
          className={className}
          label={label}
          onToggle={this.handleToggle}
          toggledOnContent={pipActiveContent}
          toggledOffContent={pipInactiveContent}
        />
      );
    } else {
      return null;
    }
  }
}

PipButton.displayName = 'PipButton';
export default PipButton;
