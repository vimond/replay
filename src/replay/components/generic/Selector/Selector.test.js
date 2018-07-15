import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Selector from './Selector';

Enzyme.configure({ adapter: new Adapter() });

const itemsWithIds = [
  { label: 'None of them' /* No id */ },
  { label: 'Kim', id: '001', data: { firstName: 'Kim', lastName: 'Jong-il', birthYear: 1983 } },
  { label: 'Angela', id: '002' },
  { label: 'Donald', id: '003' }
];
const itemsWithoutIds = [
  'None of them' /* Just a string :-o */,
  { label: 'Jeff' },
  { label: 'Sundar' },
  { label: 'Satya' }
];

function shallowRenderSelector({
  items = itemsWithIds,
  reverseOrder,
  classNamePrefix,
  classes,
  className = 'myclassname',
  itemClassName = 'myitemclassname',
  collapsedToggleContent = '+',
  expandedToggleContent = '-',
  label = 'My selector',
  selectedItem,
  selectedItemId,
  onSelect
} = {}) {
  return shallow(
    <Selector
      items={items}
      classNamePrefix={classNamePrefix}
      className={className}
      classes={classes}
      itemClassName={itemClassName}
      collapsedToggleContent={collapsedToggleContent}
      expandedToggleContent={expandedToggleContent}
      label={label}
      reverseOrder={reverseOrder}
      selectedItem={selectedItem}
      selectedItemId={selectedItemId}
      onSelect={onSelect}
    />
  );
}

test('<Selector/> renders with prefixed class name and DOM, including all selectable items in the same order as specified.', () => {
  const shallowElement = shallowRenderSelector({ classNamePrefix: 'myplayer-' });
  expect(shallowElement.name()).toEqual('div');
  expect(shallowElement.hasClass('myplayer-selector')).toBe(true);
  expect(shallowElement.hasClass('myplayer-myclassname')).toBe(true);
  expect(shallowElement.hasClass('myplayer-expanded')).toBe(false);
  expect(shallowElement.hasClass('myplayer-collapsed')).toBe(true);
  expect(shallowElement.find('ToggleButton').props().toggledOffContent).toEqual('+');
  expect(shallowElement.find('ToggleButton').props().label).toEqual('My selector');
  expect(shallowElement.find('ToggleButton').props().useDefaultClassNaming).toBe(true);

  const shallowItemsContainer = shallowElement.find('div.myplayer-selector-items');
  expect(shallowItemsContainer.length).toBe(1);
  expect(shallowItemsContainer.hasClass('myplayer-selector-items')).toBe(true);
  expect(shallowItemsContainer.children().length).toBe(4);

  const shallowSelectorItems = shallowItemsContainer.children().map(c => c.dive());
  expect(
    shallowSelectorItems.filter(
      c => c.hasClass('myplayer-selector-item') && c.hasClass('myplayer-myitemclassname')
    ).length
  ).toBe(4);
  expect(shallowSelectorItems.filter(c => c.hasClass('myplayer-selected')).length).toBe(0);

  expect(shallowSelectorItems[0].text()).toBe('None of them');
  expect(shallowSelectorItems[3].text()).toBe('Donald');
});

test('<Selector/> renders with unprefixed names from classes if specified.', () => {
  const classes = {
    selectorCollapsed: 'selector-collapsed-1',
    selectorExpanded: 'selector-expanded-1',
    selectorItemsContainer: 'selector-items-1',
    selectorItem: 'selector-item-1',
    selectorItemSelected: 'selector-item-selected-1',
    selectorToggleOff: 'selector-toggle-off',
    selectorToggleOn: 'selector-toggle-on'
  };
  const shallowElement = shallowRenderSelector({ classNamePrefix: 'myplayer-', classes });
  expect(shallowElement.name()).toEqual('div');
  expect(shallowElement.hasClass('myplayer-selector')).toBe(false);
  expect(shallowElement.hasClass('myplayer-myclassname')).toBe(false);
  expect(shallowElement.hasClass('myplayer-expanded')).toBe(false);
  expect(shallowElement.hasClass('myplayer-collapsed')).toBe(false);
  expect(shallowElement.hasClass('selector-collapsed-1')).toBe(true);
  expect(shallowElement.find('ToggleButton').props().classes).toEqual({
    toggleButtonOn: 'selector-toggle-on',
    toggleButtonOff: 'selector-toggle-off'
  });

  const shallowItemsContainer = shallowElement.find('div.selector-items-1');
  expect(shallowItemsContainer.hasClass('myplayer-selector-items')).toBe(false);

  const shallowSelectorItems = shallowItemsContainer.children().map(c => c.dive());
  expect(
    shallowSelectorItems.filter(
      c => c.hasClass('selector-item-1') // && !c.hasClass('myplayer-selector-item') && !c.hasClass('myplayer-myitemclassname')
    ).length
  ).toBe(4);

  shallowElement.setState({ isExpanded: true });
  shallowElement.update();

  expect(shallowElement.hasClass('selector-collapsed-1')).toBe(false);
  expect(shallowElement.hasClass('selector-expanded-1')).toBe(true);

  const shallowElement2 = shallowRenderSelector({ classNamePrefix: 'myplayer-', classes, selectedItem: itemsWithIds[2] });
  const shallowSelectorItems2 = shallowElement2
    .find('div.selector-items-1')
    .children()
    .map(c => c.dive());

  expect(
    shallowSelectorItems2.filter(
      c => c.hasClass('selector-item-1') // && !c.hasClass('myplayer-selector-item') && !c.hasClass('myplayer-myitemclassname')
    ).length
  ).toBe(3);

  expect(shallowSelectorItems2[2].hasClass('selector-item-selected-1')).toBe(true);
});

test('<Selector/> reverses the order of selectable items for natural appearance in the "drop up" approach.', () => {
  const shallowElement = shallowRenderSelector({ reverseOrder: true });
  const shallowItemsContainer = shallowElement.find('div.selector-items');
  const shallowSelectorItems = shallowItemsContainer.children().map(c => c.dive());

  expect(shallowSelectorItems[0].text()).toBe('Donald');
  expect(shallowSelectorItems[3].text()).toBe('None of them');
});

test('<Selector/> renders with default class name prefix (when unspecified) and DOM, including all selectable items.', () => {
  const shallowElement = shallowRenderSelector({ classNamePrefix: undefined });
  expect(shallowElement.name()).toEqual('div');
  expect(shallowElement.hasClass('selector')).toBe(true);
  expect(shallowElement.hasClass('myclassname')).toBe(true);
  expect(shallowElement.hasClass('expanded')).toBe(false);
  expect(shallowElement.hasClass('collapsed')).toBe(true);
  expect(shallowElement.find('ToggleButton').props().toggledOffContent).toEqual('+');

  const shallowItemsContainer = shallowElement.find('div.selector-items');
  expect(shallowItemsContainer.length).toBe(1);
  expect(shallowItemsContainer.hasClass('selector-items')).toBe(true);
  expect(shallowItemsContainer.children().length).toBe(4);
});

test('<Selector/> marks pre-selected item (specified by object) with class name.', () => {
  // Both based on item and based on item ID.
  const shallowElement = shallowRenderSelector({ selectedItem: itemsWithIds[3] });

  const shallowItemsContainer = shallowElement.find('div.selector-items');
  expect(shallowItemsContainer.children().length).toBe(4);

  const shallowSelectorItems = shallowItemsContainer.children().map(c => c.dive());
  expect(
    shallowSelectorItems.filter(c => c.hasClass('selector-item') && c.hasClass('myitemclassname')).length
  ).toBe(4);
  const selectedItems = shallowSelectorItems.filter(c => c.hasClass('selected'));
  expect(selectedItems.length).toBe(1);
  expect(selectedItems[0].text()).toBe('Donald');
});

test('<Selector/> marks pre-selected item (specified by its ID) with class name.', () => {
  const shallowElement = shallowRenderSelector({ selectedItemId: '002' });
  const shallowItemsContainer = shallowElement.find('div.selector-items');

  const shallowSelectorItems = shallowItemsContainer.children().map(c => c.dive());
  expect(
    shallowSelectorItems.filter(c => c.hasClass('selector-item') && c.hasClass('myitemclassname')).length
  ).toBe(4);
  const selectedItems = shallowSelectorItems.filter(c => c.hasClass('selected'));
  expect(selectedItems.length).toBe(1);
  expect(selectedItems[0].text()).toBe('Angela');
});

test('<Selector/> with items missing IDs marks pre-selected item (specified by object) with class name.', () => {
  const shallowElement = shallowRenderSelector({ items: itemsWithoutIds, selectedItem: itemsWithoutIds[2] });

  const shallowItemsContainer = shallowElement.find('div.selector-items');
  expect(shallowItemsContainer.children().length).toBe(4);

  const shallowSelectorItems = shallowItemsContainer.children().map(c => c.dive());
  expect(
    shallowSelectorItems.filter(c => c.hasClass('selector-item') && c.hasClass('myitemclassname')).length
  ).toBe(4);
  const selectedItems = shallowSelectorItems.filter(c => c.hasClass('selected'));
  expect(selectedItems.length).toBe(1);
  expect(selectedItems[0].text()).toBe('Sundar');
});

test('<Selector/> toggles an "expanded" class name when clicking on base toggle button, and also displays different content in the toggle button.', () => {
  const shallowElement = shallowRenderSelector({ selectedItemId: '002' });
  expect(shallowElement.hasClass('expanded')).toBe(false);
  expect(shallowElement.hasClass('collapsed')).toBe(true);
  expect(
    shallowElement
      .find('ToggleButton')
      .dive()
      .text()
  ).toBe('+');

  shallowElement
    .find('ToggleButton')
    .dive()
    .simulate('click');
  shallowElement.update();
  expect(shallowElement.hasClass('expanded')).toBe(true);
  expect(shallowElement.hasClass('collapsed')).toBe(false);
  expect(
    shallowElement
      .find('ToggleButton')
      .dive()
      .text()
  ).toBe('-');
});

test('<Selector/> invokes a callback when option is selected.', () => {
  const handleSelectStub = jest.fn();
  const shallowElement = shallowRenderSelector({ reverseOrder: true, selectedItemId: '002', onSelect: handleSelectStub });
  const shallowItemsContainer = shallowElement.find('div.selector-items');

  const shallowSelectorItems = shallowItemsContainer.children().map(c => c.dive());
  shallowSelectorItems[2].simulate('click');
  expect(handleSelectStub.mock.calls[0][0]).toBe(itemsWithIds[1]);
  shallowSelectorItems[3].simulate('click');
  expect(handleSelectStub.mock.calls.length).toBe(2);
  expect(handleSelectStub.mock.calls[1][0]).toBe(itemsWithIds[0]);
});
