// @flow
import * as React from 'react';
import ToggleButton from '../../generic/ToggleButton/ToggleButton';
import { defaultClassNamePrefix } from '../../common';
import type { CommonProps } from '../../common';
import type { StreamStateKeysForObservation } from '../../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  /** If true, this button will be rendered. */
  isAirPlayAvailable?: boolean,
  /** The current AirPlay state, as reported from a video streamer. */
  isAirPlayActive?: boolean,
  /** Intended for the setProperties method passed from the player controller through connectControl(). When the button is clicked, this callback is invoked with an object having an isAirPlayTargetPickerVisible property equal to true. */
  setProperties?: ({ isAirPlayTargetPickerVisible: true }) => void,
  /** The button content to be displayed while isAirPlayActive is true. */
  airPlayActiveContent: React.Node,
  /** The button content to be displayed while isAirPlayActive is false. */
  airPlayInactiveContent: React.Node
};

const className = 'airplay-button';

class AirPlayButton extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };

  static streamStateKeysForObservation: StreamStateKeysForObservation = ['isAirPlayAvailable', 'isAirPlayActive'];

  handleToggle = () => {
    if (this.props.setProperties) {
      this.props.setProperties({ isAirPlayTargetPickerVisible: true });
    }
  };

  render() {
    if (this.props.isAirPlayAvailable) {
      const { isAirPlayActive, airPlayActiveContent, airPlayInactiveContent, label, classNamePrefix } = this.props;
      return (
        <ToggleButton
          classNamePrefix={classNamePrefix}
          isOn={isAirPlayActive}
          className={className}
          label={label}
          onToggle={this.handleToggle}
          toggledOnContent={airPlayActiveContent}
          toggledOffContent={airPlayInactiveContent}
        />
      );
    } else {
      return null;
    }
  }
}

export default AirPlayButton;
