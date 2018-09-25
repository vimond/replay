// @flow
import * as React from 'react';
import ToggleButton from '../../generic/ToggleButton/ToggleButton';
import { defaultClassNamePrefix } from '../../common';
import type { CommonProps } from '../../common';
import type { StreamStateKeysForObservation } from '../../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  isPaused?: boolean,
  classes?: { pausedPlayPauseButton: string, playingPlayPauseButton: string },
  setProperty?: ({ isPaused: boolean }) => void,
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
    if (this.props.setProperty) {
      this.props.setProperty({ isPaused: value });
    }
  };

  render() {
    const { isPaused, pausedContent, playingContent, label, classNamePrefix, classes } = this.props;
    const classNames = classes
      ? isPaused
        ? classes.pausedPlayPauseButton
        : classes.playingPlayPauseButton
      : className;
    return (
      <ToggleButton
        classNamePrefix={classNamePrefix}
        isOn={isPaused}
        className={classNames}
        useDefaultClassNaming={classes == null}
        label={label}
        onToggle={this.handleToggle}
        toggledOnContent={pausedContent}
        toggledOffContent={playingContent}
      />
    );
  }
}

export default PlayPauseButton;
