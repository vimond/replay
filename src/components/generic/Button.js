// @flow 
import * as React from 'react';
import { type CommonGenericProps, prefixClassNames, defaultClassNamePrefix } from '../common';

type Props = CommonGenericProps & {
    label?: string,
    content?: React.Node,
    onClick?: () => void
};

const baseClassName = 'button';

class Button extends React.Component<Props> {
    
    handleClick = () => this.props.onClick && this.props.onClick();
    
    render() {
        const {
            label,
            className,
            classNamePrefix,
            content
        }: Props = this.props;
        const classNames = prefixClassNames(classNamePrefix, baseClassName, className);
        return <div title={label} onClick={this.handleClick} className={classNames}>{content}</div>;
    }
}

export default Button;
