import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import AudioSelector from './AudioSelector';

Enzyme.configure({ adapter: new Adapter() });

const mockTracks = [
  {
    language: 'da',
    label: 'Danish'
  },
  {
    language: 'fi'
  },
  {
    language: 'sv',
    label: 'Swedish'
  },
  {
    language: 'is',
    label: 'Icelandic'
  }
];

const render = ({ classNamePrefix = 'v-', setProperties, audioTracks = mockTracks, currentAudioTrack }) =>
  shallow(
    <AudioSelector
      classNamePrefix={classNamePrefix}
      toggleContent="A"
      setProperties={setProperties}
      label="Audio tracks"
      audioTracks={audioTracks}
      currentAudioTrack={currentAudioTrack}
    />
  );

test('<AudioSelector/> renders with all available tracks.', () => {
  const rendered = render({});
  expect(rendered.prop('label')).toBe('Audio tracks');
  expect(rendered.prop('className')).toBe('audio-selector');
  expect(rendered.prop('classNamePrefix')).toBe('v-');
  expect(rendered.prop('expandedToggleContent')).toBe('A');
  expect(rendered.prop('collapsedToggleContent')).toBe('A');
  const items = rendered.prop('items');
  expect(items.length).toBe(4);
  expect(items[3]).toEqual({ language: 'is', label: 'Icelandic' });
});

test('<AudioSelector/> does not render, if no tracks or only one track is reported as available.', () => {
  const rendered = render({ audioTracks: [] });
  expect(rendered.getElement()).toBe(null);
  const rendered2 = render({ audioTracks: [mockTracks[1]] });
  expect(rendered2.getElement()).toBe(null);
});

test('<AudioSelector/> marks the specified track as selected.', () => {
  const rendered = render({ currentAudioTrack: mockTracks[2] });
  const selectedItem = rendered.prop('selectedItem');
  expect(selectedItem).toEqual({ language: 'sv', label: 'Swedish' });
});

test('<AudioSelector/> updates property selectedTextTrack with a track when its option is selected. ', () => {
  //Should include dive() and expand of Selector?
  const setProperties = jest.fn();
  const rendered = render({ setProperties, classNamePrefix: '' });
  const itemsContainer = rendered.dive().find('div.selector-items');
  const selectorItems = itemsContainer.children().map(c => c.dive());
  selectorItems[3].simulate('click');
  expect(setProperties.mock.calls[0][0].selectedAudioTrack).toBe(mockTracks[0]);
  selectorItems[0].simulate('click');
  expect(setProperties.mock.calls[1][0].selectedAudioTrack).toBe(mockTracks[3]);
});
