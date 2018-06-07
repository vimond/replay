// @flow
import * as React from 'react';
import Button from '../generic/Button';
import { defaultClassNamePrefix } from '../common';
import type { CommonProps } from '../common';

type Props = CommonProps & {
  content: React.Node,
  onClick: () => void
};

const className = 'exit-button';

class ExitButton extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };

  render() {
    const { content, label, classNamePrefix, onClick } = this.props;
    return (
      <Button
        classNamePrefix={classNamePrefix}
        className={className}
        label={label}
        onClick={onClick}
        content={content}
      />
    );
  }
}

export default ExitButton;
