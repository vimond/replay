// @flow
import * as React from 'react';
import Button from '../generic/Button';
import { defaultClassNamePrefix } from '../common';
import type { CommonProps } from '../common';
import type { InspectMethod } from '../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  position?: number,
  offset: number,
  content: React.Node,
  inspect?: InspectMethod,
  setPosition: number => void
};

const className = 'skip-button';

class SkipButton extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix,
    offset: -30
  };

  handleClick = () => {
    if (this.props.setPosition) {
      const currentPosition =
        typeof this.props.inspect === 'function' ? this.props.inspect().position : this.props.position;
      const newPosition = currentPosition + this.props.offset;
      if (!isNaN(newPosition)) {
        this.props.setPosition(newPosition);
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
