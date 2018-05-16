import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Slider from '../generic/Slider';
import Timeline from './Timeline';

Enzyme.configure({ adapter: new Adapter() });

const commonProps = {
	label: 'Timeline',
	handleContent: '•',
	trackContent: '-',
	classNamePrefix: 'v-',
	position: 128,
	duration: 200
};

test('<Timeline/> renders with prefixed class name and DOM including children.', () => {
	const rendered = shallow(<Timeline {...commonProps}/>);
	const sliderProps = rendered.props();

	expect(sliderProps.label).toBe('Timeline');
	expect(sliderProps.classNamePrefix).toBe('v-');
	expect(sliderProps.className).toBe('timeline');
	expect(sliderProps.trackClassName).toBe('timeline-track');
	expect(sliderProps.handleClassName).toBe('timeline-handle');
	expect(sliderProps.maxValue).toBe(200);
	expect(sliderProps.value).toBe(128);
	expect(sliderProps.handleContent).toBe('•');
	expect(sliderProps.trackContent).toBe('-');
});

test('<Timeline/> updates property volume when volume slider handle is moved.', () => {
	const setPosition = jest.fn();
	const rendered = shallow(<Timeline {...commonProps} setPosition={setPosition} />);
	const renderedSlider = rendered.find(Slider).dive();

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
	renderedSlider.instance().renderedTrack = mockEventElement;
	renderedSlider.instance().handleHandleOrTrackClick(mockEvent1);

	expect(setPosition.mock.calls.length).toBe(1);
	expect(setPosition.mock.calls[0][0]).toEqual(66);
});