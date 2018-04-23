// @flow 
import * as React from 'react';
import ToggleButton from '../generic/ToggleButton';
import { defaultClassNamePrefix } from '../common';

type Props = {
	isAtLivePosition?: boolean,
	gotoLive?: () => void,
	label?: string,
	isAtLivePositionContent: React.Node,
	isNotAtLivePositionContent: React.Node,
	classNamePrefix: string
};

const className = 'goto-live-button';

class GotoLiveButton extends React.Component<Props> {
	static defaultProps = {
		classNamePrefix: defaultClassNamePrefix
	};

	handleToggle = (value: boolean) => {
		if (value && this.props.gotoLive) {
			this.props.gotoLive();
		}
	};

	render() {
		const {
			isAtLivePosition,
			isAtLivePositionContent,
			isNotAtLivePositionContent,
			label,
			classNamePrefix
		} = this.props;
		return <ToggleButton classNamePrefix={classNamePrefix} isOn={isAtLivePosition} className={className} label={label} onToggle={this.handleToggle} toggledOnContent={isAtLivePositionContent} toggledOffContent={isNotAtLivePositionContent}/>
	}
}

export default GotoLiveButton;