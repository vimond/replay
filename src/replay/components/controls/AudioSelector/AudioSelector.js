// @flow
import * as React from 'react';
import Selector from '../../generic/Selector/Selector';
import { defaultClassNamePrefix } from '../../common';
import type { AvailableTrack } from '../../player/VideoStreamer/types';
import type { CommonProps } from '../../common';
import type { StreamStateKeysForObservation } from '../../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  /** The list of audio tracks available for selection. */
  audioTracks?: Array<AvailableTrack>,
  /** The currently playing audio track (if known). Must be strict equal one of the items in the audio track list, or null. */
  currentAudioTrack?: AvailableTrack,
  /** When one item is clicked, this callback is invoked with an object having an selectedAudioTrack property with the audioTrack object corresponding to the selection. */
  setProperties?: ({ selectedAudioTrack: AvailableTrack }) => void,
  /** Element displayed in the control bar for expanding/collapsing the selector items. */
  toggleContent: React.Node
};

const className = 'audio-selector';

const buildId = (...str: Array<?string>) => str.filter(s => s).join('.');
const buildLabel = ({ label, kind = '', language = 'unknown' }: AvailableTrack) =>
  label || (kind ? `[${language}] ${kind}` : `[${language}]`);

const audioTrackToItem = (track: AvailableTrack) => {
  return { id: track.id || buildId(track.language, track.label) || track.label, label: buildLabel(track), data: track };
};

class AudioSelector extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };

  static streamStateKeysForObservation: StreamStateKeysForObservation = ['audioTracks', 'currentAudioTrack'];

  handleSelect = (item: any) => {
    if (this.props.setProperties) {
      this.props.setProperties({ selectedAudioTrack: item });
    }
  };

  render() {
    const { audioTracks, currentAudioTrack, label, toggleContent, classNamePrefix } = this.props;
    if (Array.isArray(audioTracks) && audioTracks.length > 1) {
      // TODO: Consider optimization, memoizing the array and all props involved in rendering.
      let selectedItem = audioTracks[0];
      if (currentAudioTrack) {
        const selectedIndex = audioTracks.indexOf(currentAudioTrack);
        if (selectedIndex >= 0) {
          selectedItem = audioTracks[selectedIndex]; // Ugly construct, but leaving it for now.
        }
      }
      return (
        <Selector
          items={audioTracks}
          itemMapper={audioTrackToItem}
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
