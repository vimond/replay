// @flow 
import * as React from 'react';
import { type CommonProps, prefixClassNames } from '../common';

type Props = CommonProps & {
    children: React.Node
};

class Container extends React.Component<Props> {
    baseClassName = 'container';

    render() {
        const {
            className,
            classNamePrefix,
            children
        }: Props = this.props;
        const classNames = prefixClassNames(classNamePrefix, this.baseClassName, className);
        return <div className={classNames}>{children}</div>;
    }
}

export default Container;
