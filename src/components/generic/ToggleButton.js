// @flow 
import * as React from 'react';
import { type CommonProps, prefixClassNames } from '../common';

type Props = CommonProps & {
    isOn?: boolean,
    label?: string,
    toggledOffContent?: React.Node,
    toggledOnContent?: React.Node,
    onToggle?: boolean => void
};

const baseClassName = 'toggle-button';
const offClassName = 'toggled-off';
const onClassName = 'toggled-on';

class ToggleButton extends React.Component<Props> {

    handleClick = () => this.props.onToggle && this.props.onToggle(!this.props.isOn);
    
    render() {
        const {
            isOn,
            label,
            className,
            classNamePrefix,
            toggledOnContent,
            toggledOffContent,
        }: Props = this.props;
        const toggleClassName = isOn ? onClassName : offClassName;
        const classNames = prefixClassNames(classNamePrefix, baseClassName, className, toggleClassName);
        const content = isOn ? toggledOnContent : toggledOffContent;
        return <div title={label} onClick={this.handleClick} className={classNames}>{content}</div>;
    }
}

export default ToggleButton;
