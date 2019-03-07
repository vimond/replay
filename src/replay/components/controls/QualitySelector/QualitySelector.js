// @flow
import * as React from 'react';
import Selector from '../../generic/Selector/Selector';
import { defaultClassNamePrefix } from '../../common';
import type { CommonProps } from '../../common';
import type { StreamStateKeysForObservation } from '../../player/PlayerController/ControllerContext';

export type QualitySelectionStrategy = 'cap-bitrate' | 'fix-bitrate';

type Props = CommonProps & {
  /** ⇘︎ The list of bitrates available for adaptive selection, and for being fixed or set as cap level. */
  bitrates?: Array<number>,
  /** ⇘︎ The currently playing bitrate. */
  currentBitrate?: number,
  /** ⇘︎ If playback is (already) fixed to one bitrate, this prop is set. */
  bitrateFix?: ?number,
  /** ⇘︎ If adaptive bitrate selection is (already) capped at a level, this prop is set. */
  bitrateCap?: ?number,
  /** The content of the toggle button of the selector. */
  toggleContent: React.Node,
  /** ⇗ When one item is clicked, this callback is invoked with an object having a property with either the name bitrateCap or bitrateFix and a value according to the selected bitrate. For the auto option, the value is Infinity. */
  setProperties?: ({ bitrateFix: ?number } | { bitrateCap: ?number }) => void,
  /** Configures whether the selector should specify bitrate cap or fixing. */
  selectionStrategy?: QualitySelectionStrategy,
  /** The label for the selector item used for resetting capped or fixed bitrate. */
  autoLabel: string,
  /** Should return the item text to be displayed for each bitrate. The second argument indicates if the bitrate is currently playing. */
  formatBitrateLabel: (number, boolean) => string
};

const className = 'quality-selector';

class QualitySelector extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix,
    selectionStrategy: 'cap-bitrate'
  };

  static streamStateKeysForObservation: StreamStateKeysForObservation = [
    'bitrates',
    'currentBitrate',
    'bitrateFix',
    'bitrateCap'
  ];

  handleSelect = (bitrate: number) => {
    if (this.props.setProperties) {
      if (this.props.selectionStrategy === 'fix-bitrate') {
        this.props.setProperties({ bitrateFix: bitrate });
      } else {
        this.props.setProperties({ bitrateCap: bitrate });
      }
    }
  };

  bitrateToItem = (bitrate: number) => ({
    id: bitrate,
    label:
      bitrate === Infinity
        ? this.props.autoLabel
        : this.props.formatBitrateLabel(bitrate, bitrate === this.props.currentBitrate),
    data: bitrate
  });

  isSelected = (bitrate: number, index: number, arr: Array<number>) => {
    const { bitrateFix, bitrateCap, selectionStrategy } = this.props;
    const matchValue =
      bitrateFix != null && bitrateCap != null
        ? selectionStrategy === 'fix-bitrate'
          ? bitrateFix
          : bitrateCap
        : bitrateFix || bitrateCap;
    if (matchValue === 'min') {
      return index === 1;
    } else if (matchValue === 'max') {
      return index === arr.length - 1;
    } else {
      return bitrate === matchValue;
    }
  };

  render() {
    const { bitrates, label, toggleContent, classNamePrefix } = this.props;
    if (Array.isArray(bitrates) && bitrates.length > 1) {
      const items = [Infinity].concat(bitrates);
      const selectedItem = items.filter(this.isSelected)[0] || items[0];

      return (
        <Selector
          items={items}
          itemMapper={this.bitrateToItem}
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
