// @flow
import * as React from 'react';
import { type CommonGenericProps, getKeyboardShortcutBlocker, hydrateClassNames } from '../../common';

type Props = CommonGenericProps & {
  label?: string,
  content?: React.Node,
  onClick?: () => void
};

const baseClassName = 'button';
const selectClasses = classes => classes.button;

class Button extends React.Component<Props> {
  static defaultProps = {
    useDefaultClassNaming: true
  };

  handleClick = () => this.props.onClick && this.props.onClick();

  handleKeyDown = getKeyboardShortcutBlocker(['Enter', ' ']);

  handleKeyUp = (keyboardEvent: KeyboardEvent) => {
    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
      keyboardEvent.preventDefault();
      this.handleClick();
    }
  };

  render() {
    const { label, className, classNamePrefix, classes, content }: Props = this.props;
    const classNames = hydrateClassNames({
      classes,
      selectClasses,
      classNames: [baseClassName, className],
      classNamePrefix
    }); // buildClassNames(useDefaultClassNaming, classNamePrefix, className, baseClassName);
    return (
      <div
        title={label}
        onClick={this.handleClick}
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}
        className={classNames}
        role="button"
        tabIndex={0}>
        <div tabIndex={-1}>{content}</div>
      </div>
    );
  }
}

export default Button;
