// @flow 
import * as React from 'react';
import Button from '../generic/Button';
import { defaultClassNamePrefix } from '../common';

type Props = {
	position?: number,
	offset: number,
	label?: string,
	content: React.Node,
	setPosition: number => void,
	classNamePrefix: string
};

const className = 'skip-button';

class SkipButton extends React.Component<Props> {
	static defaultProps = {
		classNamePrefix: defaultClassNamePrefix,
		offset: -30
	};

	handleClick = () => {
		if (this.props.setPosition) {
			const newPosition = this.props.position + this.props.offset;
			if (!isNaN(newPosition)) {
				this.props.setPosition(newPosition);	
			}
		}
	};

	render() {
		const {
			content,
			label,
			classNamePrefix
		} = this.props;
		return <Button classNamePrefix={classNamePrefix} className={className} label={label} onClick={this.handleClick} content={content}/>
	}
}

export default SkipButton;