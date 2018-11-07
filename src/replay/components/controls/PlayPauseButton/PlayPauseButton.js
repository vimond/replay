// @flow
import * as React from 'react';
import ToggleButton from '../../generic/ToggleButton/ToggleButton';
import { defaultClassNamePrefix } from '../../common';
import type { CommonProps } from '../../common';
import type { StreamStateKeysForObservation } from '../../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  /** ⇘︎ The current, actual pause state. If true, the convention is to display a "play" icon. */
  isPaused?: boolean,
  classes?: { pausedPlayPauseButton: string, playingPlayPauseButton: string },
  /** ⇗ When the button is clicked, this callback is invoked with an object having an isPaused property with the opposite boolean value as the isPaused prop. */
  setProperties?: ({ isPaused: boolean }) => void,
  /** Element(s) displayed when the isPaused prop is true. Typically an icon, which can be expressed as a character, SVG, img tag, or other markup. */
  playingContent: React.Node,
  /** Element(s) displayed when the isPaused prop is false. */
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
