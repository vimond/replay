// @flow
import * as React from 'react';
import Selector from '../generic/Selector';
import { defaultClassNamePrefix } from '../common';
import type { AvailableTrack } from '../player/VideoStreamer/types';
import type { CommonProps, Id } from '../common';
import type { Item } from '../generic/Selector';
import type { StreamStateKeysForObservation } from '../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  textTracks?: Array<AvailableTrack>,
  currentTextTrack?: AvailableTrack,
  updateProperty?: ({ selectedTextTrack: ?AvailableTrack }) => void,
  noSubtitlesLabel: string,
  toggleContent: React.Node
};

type State = {
  noSubtitlesItem: { id?: Id, label: string, data?: {} }
};

const className = 'subtitles-selector';

const buildId = (...str: Array<?string>) => str.filter(s => s).join('.');

// TODO: This fn should be a prop on the Selector. The Selector should accept any types for items/selectedItem.
const textTrackToItem = (track: AvailableTrack) => {
  return {
    id: track.id || buildId(track.language, track.kind, track.origin) || track.label,
    label: track.label || '',
    data: track
  };
};

class SubtitlesSelector extends React.Component<Props, State> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };

  static streamStateKeysForObservation: StreamStateKeysForObservation = ['textTracks', 'currentTextTrack'];
  
  constructor(props: Props) {
    super(props);
    this.state = {
      noSubtitlesItem: { id: 0, label: this.props.noSubtitlesLabel }
    };
  }

  handleSelect = (item: Item) => {
    if (this.props.updateProperty && typeof item !== 'string') {
      if (item.id === 0) {
        this.props.updateProperty({ selectedTextTrack: null });
      } else {
        this.props.updateProperty({ selectedTextTrack: item.data });
      }
    }
  };

  render() {
    const { textTracks, currentTextTrack, label, toggleContent, classNamePrefix } = this.props;
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
      return (
        <Selector
          items={items}
          classNamePrefix={classNamePrefix}
          className={className}
          selectedItem={selectedItem}
          label={label}
          onSelect={this.handleSelect}
          reverseOrder={true}
          expandedToggleContent={toggleContent}
          collapsedToggleContent={toggleContent}
        />
      );
    } else {
      return null;
    }
  }
}

export default SubtitlesSelector;
