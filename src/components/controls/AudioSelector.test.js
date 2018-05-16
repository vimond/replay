import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import AudioSelector from './AudioSelector';

Enzyme.configure({ adapter: new Adapter() });

const mockTracks = [{
	isSelected: false,
	language: 'da',
	label: 'Danish'
},{
	isSelected: true,
	language: 'fi'
},{
	isSelected: false,
	language: 'sv',
	label: 'Swedish'
},{
	isSelected: false,
	language: 'is',
	label: 'Icelandic'
}];


const render = ({ classNamePrefix = 'v-', updateProperty, audioTracks=mockTracks, currentAudioTrack }) => shallow(<AudioSelector
	classNamePrefix={classNamePrefix}
	toggleContent="A"
	updateProperty={updateProperty}
	label="Audio tracks"
	audioTracks={audioTracks}
	currentAudioTrack={currentAudioTrack}
/>);

test('<AudioSelector/> renders with all available tracks.', () => {
	const rendered = render({});
	expect(rendered.prop('label')).toBe('Audio tracks');
	expect(rendered.prop('className')).toBe('audio-selector');
	expect(rendered.prop('classNamePrefix')).toBe('v-');
  expect(rendered.prop('expandedToggleContent')).toBe('A');
  expect(rendered.prop('collapsedToggleContent')).toBe('A');
	const items = rendered.prop('items');
	expect(items.length).toBe(4);
	expect(items[3]).toEqual({ id: 'is.Icelandic', label: 'Icelandic', data: mockTracks[3]});
});

test('<AudioSelector/> does not render, if no tracks or only one track is reported as available.', () => {
	const rendered = render({ audioTracks: [] });
	expect(rendered.getElement()).toBe(null);
	const rendered2 = render({ audioTracks: [mockTracks[1]] });
	expect(rendered2.getElement()).toBe(null);
});


test('<AudioSelector/> marks the specified track as selected.', () => {
	// Should include isSelected? At least put a warning...
	const rendered = render({ currentAudioTrack: mockTracks[2] });
	const selectedItem = rendered.prop('selectedItem');
	expect(selectedItem).toEqual({ id: 'sv.Swedish', label: 'Swedish', data: mockTracks[2] });
});

test('<AudioSelector/> updates property selectedTextTrack with a track when its option is selected. ', () => {
	//Should include dive() and expand of DropUp?
	const updateProperty = jest.fn();
	const rendered = render({ updateProperty, classNamePrefix: '' });
	const itemsContainer = rendered.dive().find('div.drop-up-selector-items');
	const selectorItems = itemsContainer.children().map(c => c.dive());
	selectorItems[3].simulate('click');
	expect(updateProperty.mock.calls[0][0].selectedAudioTrack).toBe(mockTracks[0]);
	selectorItems[0].simulate('click');
	expect(updateProperty.mock.calls[1][0].selectedAudioTrack).toBe(mockTracks[3]);
});
