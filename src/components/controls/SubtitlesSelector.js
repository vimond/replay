// @flow 
import * as React from 'react';
import DropUpSelector from '../generic/DropUpSelector';
import { defaultClassNamePrefix } from '../common';
import type { AvailableTrack } from '../player/VideoStream/common';
import type { CommonProps, Id } from '../common';

type Props = CommonProps & {
	textTracks?: Array<AvailableTrack>,
	currentTextTrack?: AvailableTrack,
	updateProperty?: ({ selectedTextTrack: AvailableTrack }) => void,
	noSubtitlesLabel: string,
	toggleContent: React.Node
};

type State = {
	noSubtitlesItem: { id?: Id, label: string }
};

const className = 'subtitles-selector';

const buildId = (...str: Array<string>) => str.filter(s => s).join('.');

// TODO: This fn should be a prop on the DropUpSelector. The DropUpSelector should accept any types for items/selectedItem.
const textTrackToItem = (track: AvailableTrack) => {
	return { id: track.id || buildId(track.language, track.kind, track.origin) || track.label, label: track.label, track };
};

class SubtitlesSelector extends React.Component<Props, State> {
	static defaultProps = {
		classNamePrefix: defaultClassNamePrefix
	};
	
	constructor(props: Props) {
		super(props);
		this.state = {
			noSubtitlesItem: { id: 0, label: this.props.noSubtitlesLabel }
		};
	};

	handleSelect = (item: AvailableTrack) => {
		if (this.props.updateProperty) {
			if (item.id === 0) {
				this.props.updateProperty({ selectedTextTrack: null });
			} else {
				this.props.updateProperty({ selectedTextTrack: item.track });
			}
		}
	};

	render() {
		const {
			textTracks,
			currentTextTrack,
			label,
			toggleContent,
			classNamePrefix
		} = this.props;
		if (Array.isArray(textTracks) && textTracks.length > 0) {
			// Needs optimisation. See TODO related to textTrackToItem.
			const items = [this.state.noSubtitlesItem].concat(textTracks.map(textTrackToItem));
			let selectedItem = this.state.noSubtitlesItem;
			if (currentTextTrack) {
				const selectedIndex = textTracks.indexOf(currentTextTrack) + 1; // Nasty detail. Including "no subtitles" when counting.
				if (selectedIndex > 0) {
					selectedItem = items[selectedIndex];
				}
			}
			return <DropUpSelector
				items={items}
				classNamePrefix={classNamePrefix}
				className={className}
				selectedItem={selectedItem}
				label={label}
				onSelect={this.handleSelect}
				reverseOrder={true}
				toggledOnContent={toggleContent}
				toggledOffContent={toggleContent}/>
		} else {
			return null;
		}
	}
}

export default SubtitlesSelector;