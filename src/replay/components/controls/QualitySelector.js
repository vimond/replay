// @flow
import * as React from 'react';
import DropUpSelector from '../generic/DropUpSelector';
import { defaultClassNamePrefix } from '../common';
import type { CommonProps } from '../common';
import type { Item } from '../generic/DropUpSelector';
import type { StreamStateKeysForObservation } from '../player/player-controller/ControllerContext';

export type QualitySelectionStrategy = 'cap-bitrate' | 'lock-bitrate';

type Props = CommonProps & {
  bitrates?: Array<number>,
  currentBitrate?: number,
  lockedBitrate?: ?number,
  maxBitrate?: ?number,
  toggleContent: React.Node,
  updateProperty?: ({ lockedBitrate: ?number } | { maxBitrate: ?number }) => void,
  selectionStrategy?: QualitySelectionStrategy,
  autoLabel: string,
  formatBitrateLabel: (number, boolean) => string
};

const className = 'quality-selector';

class QualitySelector extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix,
    selectionStrategy: 'cap-bitrate'
  };

  static streamStateKeysForObservation: StreamStateKeysForObservation = ['bitrates', 'currentBitrate', 'lockedBitrate', 'maxBitrate'];
  
  handleSelect = (item: Item) => {
    if (this.props.updateProperty && typeof item !== 'string') {
      if (this.props.selectionStrategy === 'lock-bitrate') {
        this.props.updateProperty({ lockedBitrate: item.data });
      } else {
        this.props.updateProperty({ maxBitrate: item.data });
      }
    }
  };

  bitrateToItem = (bitrate: number) => ({
    id: bitrate,
    label: this.props.formatBitrateLabel(bitrate, bitrate === this.props.currentBitrate),
    data: bitrate
  });

  render() {
    const {
      bitrates,
      maxBitrate,
      lockedBitrate,
      label,
      autoLabel,
      toggleContent,
      selectionStrategy,
      classNamePrefix
    } = this.props;
    if (Array.isArray(bitrates) && bitrates.length > 1) {
      const items = [{ id: 0, label: autoLabel, data: Infinity }].concat(bitrates.map(this.bitrateToItem));
      const selectedItem =
        items.filter(
          i => typeof i !== 'string' && i.id === (selectionStrategy === 'lock-bitrate' ? lockedBitrate : maxBitrate)
        )[0] || items[0];

      return (
        <DropUpSelector
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

export default QualitySelector;
