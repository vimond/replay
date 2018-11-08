// @flow
import * as React from 'react';
import Button from '../../generic/Button/Button';
import { defaultClassNamePrefix } from '../../common';
import type { CommonProps } from '../../common';
import type { InspectMethod } from '../../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  /** The position from which the skipped position is computed. Not recommended to set this, but rather provide inspect(). */
  position?: number,
  /** Configures the offset that will be added to the current position when clicking the button. Negative values mean skipping backward. */
  offset: number,
  /** Button content, e.g. icon. */
  content: React.Node,
  /** ⇘︎ A callback returning the current video stream state with a position property when invoked. Invoked on clicking the button, and the position property is used for computing the new position. */
  inspect?: InspectMethod,
  /** ⇗ When the button is clicked, this callback is invoked with an object having an position property with the computed new position based on the skip offset. */
  setProperties?: ({ position: number }) => void
};

const className = 'skip-button';

class SkipButton extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix,
    offset: -30
  };

  handleClick = () => {
    const setProperties = this.props.setProperties;
    if (setProperties) {
      const currentPosition =
        typeof this.props.inspect === 'function' ? this.props.inspect().position : this.props.position;
      const position = currentPosition + this.props.offset;
      if (!isNaN(position)) {
        setProperties({ position });
      }
    }
  };

  render() {
    const { content, label, classNamePrefix } = this.props;
    return (
      <Button
        classNamePrefix={classNamePrefix}
        className={className}
        label={label}
        onClick={this.handleClick}
        content={content}
      />
    );
  }
}

export default SkipButton;
