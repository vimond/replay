import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import DropUpSelector from './DropUpSelector';

Enzyme.configure({ adapter: new Adapter() });

const itemsWithIds = [{ label: 'None of them' /* No id */ }, { label: 'Kim', id: '001' }, { label: 'Vladimir', id: '002' }, { label: 'Donald', id: '003' }];
const itemsWithoutIds = ['None of them' /* Just a string :-o */, { label: 'Jeff' }, { label: 'Sundar' }, { label: 'Satya' }];


// TODO: Test items without ID.

function shallowRenderDropUp({ items=itemsWithIds, reverseOrder, classNamePrefix, className='myclassname', itemClassName='myitemclassname', collapsedToggleContent='+', expandedToggleContent='-', label='My selector', selectedItem, selectedItemId, onSelect } = {}) {
    return shallow(<DropUpSelector 
        items={items} 
        classNamePrefix={classNamePrefix} 
        className={className}
        itemClassName={itemClassName}
        collapsedToggleContent={collapsedToggleContent} 
        expandedToggleContent={expandedToggleContent}
        label={label}
        reverseOrder={reverseOrder}
        selectedItem={selectedItem}
        selectedItemId={selectedItemId}
        onSelect={onSelect}
    />);
}

test('<DropUpSelector/> renders with prefixed class name and DOM, including all selectable items in the same order as specified.', () => {
    const shallowElement = shallowRenderDropUp({ classNamePrefix: 'myplayer-' });
    expect(shallowElement.name()).toEqual('div');
    expect(shallowElement.hasClass('myplayer-drop-up-selector')).toBe(true);
    expect(shallowElement.hasClass('myplayer-myclassname')).toBe(true);
    expect(shallowElement.hasClass('myplayer-expanded')).toBe(false);
    expect(shallowElement.hasClass('myplayer-collapsed')).toBe(true);
    expect(shallowElement.find('ToggleButton').props().toggledOffContent).toEqual('+');
    expect(shallowElement.find('ToggleButton').props().label).toEqual('My selector');
    
    const shallowItemsContainer = shallowElement.find('div.myplayer-drop-up-selector-items');
    expect(shallowItemsContainer.length).toBe(1);
    expect(shallowItemsContainer.hasClass('myplayer-drop-up-selector-items')).toBe(true);
    expect(shallowItemsContainer.children().length).toBe(4);

    const shallowSelectorItems = shallowItemsContainer.children().map(c => c.dive());
    expect(shallowSelectorItems.filter(c => c.hasClass('myplayer-drop-up-selector-item') && c.hasClass('myplayer-myitemclassname')).length).toBe(4);
    expect(shallowSelectorItems.filter(c => c.hasClass('myplayer-selected')).length).toBe(0);

    expect(shallowSelectorItems[0].text()).toBe('None of them');
    expect(shallowSelectorItems[3].text()).toBe('Donald');
});

test('<DropUpSelector/> reverses the order of selectable items for natural appearance in the "drop up" approach.', () => {
    const shallowElement = shallowRenderDropUp({ reverseOrder: true });
    const shallowItemsContainer = shallowElement.find('div.drop-up-selector-items');
    const shallowSelectorItems = shallowItemsContainer.children().map(c => c.dive());

    expect(shallowSelectorItems[0].text()).toBe('Donald');
    expect(shallowSelectorItems[3].text()).toBe('None of them');
});


test('<DropUpSelector/> renders with default class name prefix (when unspecified) and DOM, including all selectable items.', () => {
    const shallowElement = shallowRenderDropUp({ classNamePrefix: undefined });
    expect(shallowElement.name()).toEqual('div');
    expect(shallowElement.hasClass('drop-up-selector')).toBe(true);
    expect(shallowElement.hasClass('myclassname')).toBe(true);
    expect(shallowElement.hasClass('expanded')).toBe(false);
    expect(shallowElement.hasClass('collapsed')).toBe(true);
    expect(shallowElement.find('ToggleButton').props().toggledOffContent).toEqual('+');

    const shallowItemsContainer = shallowElement.find('div.drop-up-selector-items');
    expect(shallowItemsContainer.length).toBe(1);
    expect(shallowItemsContainer.hasClass('drop-up-selector-items')).toBe(true);
    expect(shallowItemsContainer.children().length).toBe(4);
});

test('<DropUpSelector/> marks pre-selected item (specified by object) with class name.', () => {
    // Both based on item and based on item ID.
    const shallowElement = shallowRenderDropUp({ selectedItem: itemsWithIds[3] });
    
    const shallowItemsContainer = shallowElement.find('div.drop-up-selector-items');
    expect(shallowItemsContainer.children().length).toBe(4);

    const shallowSelectorItems = shallowItemsContainer.children().map(c => c.dive());
    expect(shallowSelectorItems.filter(c => c.hasClass('drop-up-selector-item') && c.hasClass('myitemclassname')).length).toBe(4);
    const selectedItems = shallowSelectorItems.filter(c => c.hasClass('selected'));
    expect(selectedItems.length).toBe(1);
    expect(selectedItems[0].text()).toBe('Donald');
});

test('<DropUpSelector/> marks pre-selected item (specified by its ID) with class name.', () => {
    const shallowElement = shallowRenderDropUp({ selectedItemId: '002' });
    const shallowItemsContainer = shallowElement.find('div.drop-up-selector-items');

    const shallowSelectorItems = shallowItemsContainer.children().map(c => c.dive());
    expect(shallowSelectorItems.filter(c => c.hasClass('drop-up-selector-item') && c.hasClass('myitemclassname')).length).toBe(4);
    const selectedItems = shallowSelectorItems.filter(c => c.hasClass('selected'));
    expect(selectedItems.length).toBe(1);
    expect(selectedItems[0].text()).toBe('Vladimir');
});

test('<DropUpSelector/> with items missing IDs marks pre-selected item (specified by object) with class name.', () => {
    const shallowElement = shallowRenderDropUp({ items: itemsWithoutIds, selectedItem: itemsWithoutIds[2] });

    const shallowItemsContainer = shallowElement.find('div.drop-up-selector-items');
    expect(shallowItemsContainer.children().length).toBe(4);

    const shallowSelectorItems = shallowItemsContainer.children().map(c => c.dive());
    expect(shallowSelectorItems.filter(c => c.hasClass('drop-up-selector-item') && c.hasClass('myitemclassname')).length).toBe(4);
    const selectedItems = shallowSelectorItems.filter(c => c.hasClass('selected'));
    expect(selectedItems.length).toBe(1);
    expect(selectedItems[0].text()).toBe('Sundar');
});

test('<DropUpSelector/> toggles an "expanded" class name when clicking on base toggle button, and also displays different content in the toggle button.', () => {
    const shallowElement = shallowRenderDropUp({ selectedItemId: '002' });
    expect(shallowElement.hasClass('expanded')).toBe(false);
    expect(shallowElement.hasClass('collapsed')).toBe(true);
    expect(shallowElement.find('ToggleButton').dive().text()).toBe('+');
    
    shallowElement.find('ToggleButton').dive().simulate('click');
    shallowElement.update();
    expect(shallowElement.hasClass('expanded')).toBe(true);
    expect(shallowElement.hasClass('collapsed')).toBe(false);
    expect(shallowElement.find('ToggleButton').dive().text()).toBe('-');
});

test('<DropUpSelector/> invokes a callback when option is selected.', () => {
    const handleSelectStub = jest.fn();
    const shallowElement = shallowRenderDropUp({ reverseOrder: true, selectedItemId: '002', onSelect: handleSelectStub });
    const shallowItemsContainer = shallowElement.find('div.drop-up-selector-items');

    const shallowSelectorItems = shallowItemsContainer.children().map(c => c.dive());
    shallowSelectorItems[2].simulate('click');
    expect(handleSelectStub.mock.calls.length).toBe(1);
    expect(handleSelectStub.mock.calls[0][0]).toBe(itemsWithIds[1]);
    shallowSelectorItems[3].simulate('click');
    expect(handleSelectStub.mock.calls.length).toBe(2);
    expect(handleSelectStub.mock.calls[1][0]).toBe(itemsWithIds[0]);
});