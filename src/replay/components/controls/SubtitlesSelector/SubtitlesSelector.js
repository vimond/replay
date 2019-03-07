// @flow
import * as React from 'react';
import Selector from '../../generic/Selector/Selector';
import { defaultClassNamePrefix } from '../../common';
import type { AvailableTrack } from '../../player/VideoStreamer/types';
import type { CommonProps } from '../../common';
import type { StreamStateKeysForObservation } from '../../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  /** ⇘︎ The list of text tracks available for selection. */
  textTracks?: Array<AvailableTrack>,
  /** ⇘ The currently displaying text track. Must be strict equal one of the items in the text track list. Set to null if no subtitles are displayed. */
  currentTextTrack?: AvailableTrack,
  /** ⇗ When one item is clicked, this callback is invoked with an object having an selectedTextTrack property with the textTrack object corresponding to the selection. */
  setProperties?: ({ selectedTextTrack: ?AvailableTrack }) => void,
  /** The label to use on the selector option for not displaying subtitles. */
  noSubtitlesLabel: string,
  /** Element displayed in the control bar for expanding/collapsing the selector items. */
  toggleContent: React.Node
};

type State = {
  noSubtitlesItem: { noTrack: true, label: string }
};

const className = 'subtitles-selector';

const defaultKind = 'subtitles';

const buildId = (...str: Array<?string>) => str.filter(s => s).join('.');
// TODO: Consider injectable label mapper, and also for audio selector and bitrate selector.
const buildLabel = ({ label, kind = defaultKind, language = 'unknown' }: AvailableTrack) =>
  label || (kind !== defaultKind ? `[${language}] ${kind}` : `[${language}]`) || '';

const textTrackToItem = (track: AvailableTrack | { noTrack: true, label: string }) => {
  if (track.noTrack) {
    const label = track.label || '';
    return {
      id: 0,
      label,
      data: track
    };
  } else {
    return {
      id: track.id || buildId(track.language, track.kind, track.origin) || track.label,
      label: buildLabel(track),
      data: track
    };
  }
};

class SubtitlesSelector extends React.Component<Props, State> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };

  static streamStateKeysForObservation: StreamStateKeysForObservation = ['textTracks', 'currentTextTrack'];

  constructor(props: Props) {
    super(props);
    this.state = {
      noSubtitlesItem: { noTrack: true, label: this.props.noSubtitlesLabel }
    };
  }

  handleSelect = (item: any) => {
    if (this.props.setProperties) {
      if (item.noTrack) {
        this.props.setProperties({ selectedTextTrack: null });
      } else {
        this.props.setProperties({ selectedTextTrack: item });
      }
    }
  };

  render() {
    const { textTracks, currentTextTrack, label, toggleContent, classNamePrefix } = this.props;
    if (Array.isArray(textTracks) && textTracks.length > 0) {
      // TODO: Consider optimization, memoizing the array and all props involved in rendering.
      const items = [this.state.noSubtitlesItem].concat(textTracks);
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
          itemMapper={textTrackToItem}
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
