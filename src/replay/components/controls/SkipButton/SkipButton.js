// @flow
import * as React from 'react';
import Button from '../../generic/Button/Button';
import { defaultClassNamePrefix } from '../../common';
import type { CommonProps } from '../../common';
import type { InspectMethod } from '../../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  position?: number,
  offset: number,
  content: React.Node,
  inspect?: InspectMethod,
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
