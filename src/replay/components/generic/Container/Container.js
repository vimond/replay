// @flow
import * as React from 'react';
import { hydrateClassNames, type CommonGenericProps, defaultClassNamePrefix } from '../../common';

type Props = CommonGenericProps & {
  children: React.Node
};

class Container extends React.Component<Props> {
  baseClassName = 'container';
  selectClasses: ({ [string]: ?string }) => ?string | ?Array<?string> = classes => classes.container;

  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix,
    useDefaultClassNaming: true
  };

  render() {
    const { className, classNamePrefix, classes, children }: Props = this.props;
    const { selectClasses } = this;
    const classNames = hydrateClassNames({
      classes,
      selectClasses,
      classNamePrefix,
      classNames: [className, this.baseClassName]
    });
    return <div className={classNames}>{children}</div>;
  }
}

export default Container;
