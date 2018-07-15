import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Volume from './Volume';
import ToggleButton from '../../generic/ToggleButton/ToggleButton';
import Slider from '../../generic/Slider/Slider';

Enzyme.configure({ adapter: new Adapter() });

const commonProps = {
  label: 'Volume and mute',
  muteToggleLabel: 'Toggle mute',
  volumeSliderLabel: 'Volume setting',
  mutedContent: 'M',
  unmutedContent: 'A',
  volumeSliderHandleContent: '•',
  volumeSliderTrackContent: '-',
  classNamePrefix: 'v-',
  volume: 0.7,
  isMuted: true
};

test('<Volume/> renders with prefixed class name and DOM including children.', () => {
  const rendered = shallow(<Volume {...commonProps} />);

  const container = rendered.find('div');
  const muteToggle = rendered.find(ToggleButton);
  const volumeSlider = rendered.find(Slider);

  const vsProps = volumeSlider.props();
  const mtProps = muteToggle.props();

  expect(container.props().title).toBe('Volume and mute');
  expect(container.props().className).toBe('v-volume');

  expect(vsProps.label).toBe('Volume setting');
  expect(vsProps.classNamePrefix).toBe('v-');
  expect(vsProps.className).toBe('volume-slider');
  expect(vsProps.trackClassName).toBe('volume-slider-track');
  expect(vsProps.handleClassName).toBe('volume-slider-handle');
  expect(vsProps.maxValue).toBe(1);
  expect(vsProps.value).toBe(0.7);
  expect(vsProps.handleContent).toBe('•');
  expect(vsProps.trackContent).toBe('-');

  expect(mtProps.label).toBe('Toggle mute');
  expect(mtProps.classNamePrefix).toBe('v-');
  expect(mtProps.className).toBe('mute-toggle');
  expect(mtProps.isOn).toBe(true);
  expect(mtProps.toggledOffContent).toBe('A');
  expect(mtProps.toggledOnContent).toBe('M');
});

test('<Volume/> updates property isMuted when mute toggle is clicked.', () => {
  const updateProperty = jest.fn();
  const rendered = shallow(<Volume {...commonProps} updateProperty={updateProperty} />);
  const renderedMuteToggle = rendered.find(ToggleButton).dive();
  renderedMuteToggle.simulate('click');
  expect(updateProperty.mock.calls.length).toBe(1);
  expect(updateProperty.mock.calls[0][0]).toEqual({ isMuted: false });
});
test('<Volume/> updates property volume when volume slider handle is moved.', () => {
  const updateProperty = jest.fn();
  const rendered = shallow(<Volume {...commonProps} updateProperty={updateProperty} />);
  const renderedVolumeSlider = rendered.find(Slider).dive();

  const mockEventElement = {
    getBoundingClientRect: function() {
      return {
        top: 0,
        left: 0,
        width: 100,
        height: 40
      };
    }
  };
  const mockEvent1 = {
    currentTarget: mockEventElement,
    pageX: 33,
    pageY: 23
  };
  renderedVolumeSlider.instance().renderedTrack = mockEventElement;
  renderedVolumeSlider.instance().handleHandleOrTrackClick(mockEvent1);

  expect(updateProperty.mock.calls.length).toBe(1);
  expect(updateProperty.mock.calls[0][0]).toEqual({ volume: 0.33 });
});
