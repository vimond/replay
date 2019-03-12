// @flow
import * as React from 'react';
import ToggleButton from '../../generic/ToggleButton/ToggleButton';
import { defaultClassNamePrefix } from '../../common';
import type { CommonProps } from '../../common';
import type { StreamStateKeysForObservation } from '../../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  isPaused?: boolean,
  setProperties?: ({ isPaused: boolean }) => void,

  playingContent: React.Node,
  pausedContent: React.Node
};

const className = 'play-pause-button';

class PlayPauseButton extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };

  static streamStateKeysForObservation: StreamStateKeysForObservation = ['isPaused'];

  handleToggle = (value: boolean) => {
    if (this.props.setProperties) {
      this.props.setProperties({ isPaused: value });
    }
  };

  render() {
    const { isPaused, pausedContent, playingContent, label, classNamePrefix } = this.props;
    return (
      <ToggleButton
        classNamePrefix={classNamePrefix}
        isOn={isPaused}
        className={className}
        useDefaultClassNaming={true}
        label={label}
        onToggle={this.handleToggle}
        toggledOnContent={pausedContent}
        toggledOffContent={playingContent}
      />
    );
  }
}

PlayPauseButton.displayName = 'PlayPauseButton';
export default PlayPauseButton;
