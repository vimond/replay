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
  const items = rendered.dive().find('SelectorItem');
  expect(items.length).toBe(6);
  expect(items.get(2).props.item).toEqual({ id: 999, label: '999 kbps', data: 999 });
  expect(items.get(5).props.item).toEqual({ id: Infinity, label: 'Auto quality', data: Infinity });
});

test('<QualitySelector/> does not render if no or only an invalid bitrate option is reported.', () => {
  const rendered = shallow(<QualitySelector {...commonProps} bitrates={[0]} />);
  expect(rendered.getElement()).toBe(null);
  const rendered2 = shallow(<QualitySelector {...commonProps} bitrates={[]} />);
  expect(rendered2.getElement()).toBe(null);
  const rendered3 = shallow(<QualitySelector {...commonProps} bitrates={null} />);
  expect(rendered3.getElement()).toBe(null);
});

test('<QualitySelector/> with strategy "fix-bitrate" highlights the quality option corresponding with the reported locked bitrate as selected.', () => {
  const rendered = shallow(<QualitySelector {...commonProps} selectionStrategy="fix-bitrate" bitrateFix={999} />);
  const selectedItem = rendered.prop('selectedItem');
  expect(selectedItem).toEqual(999);
});

test('<QualitySelector/> with strategy "fix-bitrate" highlights the lowest quality option when locked bitrate is set to "min".', () => {
  const rendered = shallow(<QualitySelector {...commonProps} selectionStrategy="fix-bitrate" bitrateFix="min" />);
  const selectedItem = rendered.prop('selectedItem');
  expect(selectedItem).toEqual(333);
});

test('<QualitySelector/> with strategy "fix-bitrate" highlights the highest quality option when locked bitrate is set to "max".', () => {
  const rendered = shallow(<QualitySelector {...commonProps} selectionStrategy="fix-bitrate" bitrateFix="max" />);
  const selectedItem = rendered.prop('selectedItem');
  expect(selectedItem).toEqual(4444);
});

test('<QualitySelector/> marks the currently playing bitrate next to the option label.', () => {
  const rendered = shallow(<QualitySelector {...commonProps} />).dive();
  const currentBitrateItem = rendered.find('SelectorItem').get(1).props.item;
  expect(currentBitrateItem.label).toBe('2222 kbps •');
});

test('<QualitySelector/> with strategy "cap-bitrate" highlights the quality option corresponding with the reported max bitrate as selected.', () => {
  const rendered = shallow(<QualitySelector {...commonProps} selectionStrategy="cap-bitrate" bitrateCap={666} />);
  const selectedItem = rendered.prop('selectedItem');
  expect(selectedItem).toEqual(666);
});

test('<QualitySelector/> with strategy "fix-bitrate" updates property bitrateFix with the bitrate value when its option is selected. ', () => {
  const setPropertiesCallback = jest.fn();
  const rendered = shallow(
    <QualitySelector
      {...commonProps}
      setProperties={setPropertiesCallback}
      selectionStrategy="fix-bitrate"
      classNamePrefix=""
    />
  );
  const itemsContainer = rendered.dive().find('div.selector-items');
  const selectorItems = itemsContainer.children().map(c => c.dive());
  selectorItems[4].simulate('click');
  expect(setPropertiesCallback.mock.calls[0][0].bitrateFix).toBe(333);
  selectorItems[5].simulate('click');
  expect(setPropertiesCallback.mock.calls[1][0].bitrateFix).toBe(Infinity);
});

test('<QualitySelector/> with strategy cap-bitrate updates property bitrateCap with the bitrate value when its option is selected.', () => {
  const setPropertiesCallback = jest.fn();
  const rendered = shallow(
    <QualitySelector
      {...commonProps}
      setProperties={setPropertiesCallback}
      selectionStrategy="cap-bitrate"
      classNamePrefix=""
    />
  );
  const itemsContainer = rendered.dive().find('div.selector-items');
  const selectorItems = itemsContainer.children().map(c => c.dive());
  selectorItems[0].simulate('click');
  expect(setPropertiesCallback.mock.calls[0][0].bitrateCap).toBe(4444);
  selectorItems[5].simulate('click');
  expect(setPropertiesCallback.mock.calls[1][0].bitrateCap).toBe(Infinity);
});
