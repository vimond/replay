// @flow

import * as React from 'react';
import Selector from '../../generic/Selector/Selector';
import { defaultClassNamePrefix } from '../../common';
import type { AvailableTrack } from '../../player/VideoStreamer/types';
import type { CommonProps } from '../../common';
import type { Item } from '../../generic/Selector/Selector';
import type { StreamStateKeysForObservation } from '../../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  audioTracks?: Array<AvailableTrack>,
  currentAudioTrack?: AvailableTrack,
  setProperties?: ({ selectedAudioTrack: AvailableTrack }) => void,
  toggleContent: React.Node
};

const className = 'audio-selector';

const buildId = (...str: Array<?string>) => str.filter(s => s).join('.');
const buildLabel = ({ label, kind = '', language = 'unknown' }: AvailableTrack) =>
  label || (kind ? `[${language}] ${kind}` : `[${language}]`);

// TODO: This fn should be a prop on the Selector. The Selector should accept any types for items/selectedItem.
const audioTrackToItem = (track: AvailableTrack) => {
  return { id: track.id || buildId(track.language, track.label) || track.label, label: buildLabel(track), data: track };
};

class AudioSelector extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };

  static streamStateKeysForObservation: StreamStateKeysForObservation = ['audioTracks', 'currentAudioTrack'];

  handleSelect = (item: Item) => {
    if (this.props.setProperties && typeof item !== 'string' && item.data) {
      this.props.setProperties({ selectedAudioTrack: item.data });
    }
  };

  render() {
    const { audioTracks, currentAudioTrack, label, toggleContent, classNamePrefix } = this.props;
    if (Array.isArray(audioTracks) && audioTracks.length > 1) {
      // Needs optimisation. See TODO related to audioTrackToItem.
      const items = audioTracks.map(audioTrackToItem);
      let selectedItem = items[0];
      if (currentAudioTrack) {
        const selectedIndex = audioTracks.indexOf(currentAudioTrack);
        if (selectedIndex >= 0) {
          selectedItem = items[selectedIndex]; // Ugly construct, but leaving it for now.
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

export default AudioSelector;
