import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import QualitySelector from './QualitySelector';

Enzyme.configure({ adapter: new Adapter() });

const commonProps = {
  classNamePrefix: 'v-',
  toggleContent: 'Q',
  bitrates: [333, 666, 999, 2222, 4444],
  currentBitrate: 2222,
  selectionStrategy: 'cap-bitrate',
  label: 'Quality selector',
  formatBitrateLabel: (bitrate, isPlaying) => `${bitrate} kbps${isPlaying ? ' •' : ''}`,
  autoLabel: 'Auto quality'
};

test('<QualitySelector/> renders with all available quality options and an "Auto" option', () => {
  const rendered = shallow(<QualitySelector {...commonProps} />);
  expect(rendered.prop('label')).toBe('Quality selector');
  expect(rendered.prop('className')).toBe('quality-selector');
  expect(rendered.prop('classNamePrefix')).toBe('v-');
  expect(rendered.prop('expandedToggleContent')).toBe('Q');
  expect(rendered.prop('collapsedToggleContent')).toBe('Q');
  const items = rendered.prop('items');
  expect(items.length).toBe(6);
  expect(items[3]).toEqual({ id: 999, label: '999 kbps', data: 999 });
  expect(items[0]).toEqual({ id: 0, label: 'Auto quality', data: Infinity });
});

test('<QualitySelector/> does not render if no or only an invalid bitrate option is reported.', () => {
  const rendered = shallow(<QualitySelector {...commonProps} bitrates={[0]} />);
  expect(rendered.getElement()).toBe(null);
  const rendered2 = shallow(<QualitySelector {...commonProps} bitrates={[]} />);
  expect(rendered2.getElement()).toBe(null);
  const rendered3 = shallow(<QualitySelector {...commonProps} bitrates={null} />);
  expect(rendered3.getElement()).toBe(null);
});

test('<QualitySelector/> with strategy "lock-bitrate" highlights the quality option corresponding with the reported locked bitrate as selected.', () => {
  const rendered = shallow(<QualitySelector {...commonProps} selectionStrategy="lock-bitrate" lockedBitrate={999} />);
  const selectedItem = rendered.prop('selectedItem');
  expect(selectedItem).toEqual({ id: 999, label: '999 kbps', data: 999 });
});

test('<QualitySelector/> with strategy "lock-bitrate" highlights the lowest quality option when locked bitrate is set to "min".', () => {
  const rendered = shallow(<QualitySelector {...commonProps} selectionStrategy="lock-bitrate" lockedBitrate="min" />);
  const selectedItem = rendered.prop('selectedItem');
  expect(selectedItem).toEqual({ id: 333, label: '333 kbps', data: 333 });
});

test('<QualitySelector/> with strategy "lock-bitrate" highlights the highest quality option when locked bitrate is set to "max".', () => {
  const rendered = shallow(<QualitySelector {...commonProps} selectionStrategy="lock-bitrate" lockedBitrate="max" />);
  const selectedItem = rendered.prop('selectedItem');
  expect(selectedItem).toEqual({ id: 4444, label: '4444 kbps', data: 4444 });
});

test('<QualitySelector/> marks the currently playing bitrate next to the option label.', () => {
  const rendered = shallow(<QualitySelector {...commonProps} />);
  const currentBitrateItem = rendered.prop('items')[4];
  expect(currentBitrateItem.label).toBe('2222 kbps •');
});

test('<QualitySelector/> with strategy "cap-bitrate" highlights the quality option corresponding with the reported max bitrate as selected.', () => {
  const rendered = shallow(<QualitySelector {...commonProps} selectionStrategy="cap-bitrate" maxBitrate={666} />);
  const selectedItem = rendered.prop('selectedItem');
  expect(selectedItem).toEqual({ id: 666, label: '666 kbps', data: 666 });
});

test('<QualitySelector/> with strategy "lock-bitrate" updates property lockedBitrate with the bitrate value when its option is selected. ', () => {
  const updateProperty = jest.fn();
  const rendered = shallow(
    <QualitySelector
      {...commonProps}
      updateProperty={updateProperty}
      selectionStrategy="lock-bitrate"
      classNamePrefix=""
    />
  );
  const itemsContainer = rendered.dive().find('div.selector-items');
  const selectorItems = itemsContainer.children().map(c => c.dive());
  selectorItems[4].simulate('click');
  expect(updateProperty.mock.calls[0][0].lockedBitrate).toBe(333);
  selectorItems[5].simulate('click');
  expect(updateProperty.mock.calls[1][0].lockedBitrate).toBe(Infinity);
});

test('<QualitySelector/> with strategy cap-bitrate updates property maxBitrate with the bitrate value when its option is selected.', () => {
  const updateProperty = jest.fn();
  const rendered = shallow(
    <QualitySelector
      {...commonProps}
      updateProperty={updateProperty}
      selectionStrategy="cap-bitrate"
      classNamePrefix=""
    />
  );
  const itemsContainer = rendered.dive().find('div.selector-items');
  const selectorItems = itemsContainer.children().map(c => c.dive());
  selectorItems[0].simulate('click');
  expect(updateProperty.mock.calls[0][0].maxBitrate).toBe(4444);
  selectorItems[5].simulate('click');
  expect(updateProperty.mock.calls[1][0].maxBitrate).toBe(Infinity);
});
