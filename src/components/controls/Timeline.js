// @flow 
import * as React from 'react';
import { defaultClassNamePrefix } from '../common';
import type { CommonProps } from '../common';
import Slider from '../generic/Slider';

type Props = CommonProps & {
	position?: number,
	duration?: number,
	handleContent: React.Node,
	trackContent: React.Node,
	updateProperty?: ({ position: number }) => void
};

const className = 'timeline';
const trackClassName = 'timeline-track';
const handleClassName = 'timeline-handle';

class Timeline extends React.Component<Props> {
	static defaultProps = {
		classNamePrefix: defaultClassNamePrefix
	};

	handleSliderChange = (position: number) => {
		if (this.props.updateProperty) {
			this.props.updateProperty({ position });
		}
	};

	render() {
		const {
			position,
			duration,
			label,
			classNamePrefix,
			handleContent,
			trackContent
		} = this.props;
		return (
			<Slider
				label={label}
				value={position}
				maxValue={duration}
				handleContent={handleContent}
				trackContent={trackContent}
				onValueChange={this.handleSliderChange}
				classNamePrefix={classNamePrefix}
				className={className}
				trackClassName={trackClassName}
				handleClassName={handleClassName}
			/>
		);
	}
}

export default Timeline;