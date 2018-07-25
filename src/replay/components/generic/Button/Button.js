// @flow
import * as React from 'react';
import { type CommonGenericProps, hydrateClassNames } from '../../common';

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

  render() {
    const { label, className, classNamePrefix, classes, content }: Props = this.props;
    const classNames = hydrateClassNames({
      classes,
      selectClasses,
      classNames: [baseClassName, className],
      classNamePrefix
    }); // buildClassNames(useDefaultClassNaming, classNamePrefix, className, baseClassName);
    return (
      <div title={label} onClick={this.handleClick} className={classNames}>
        {content}
      </div>
    );
  }
}

export default Button;
