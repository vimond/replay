import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import PlayPauseButton from './PlayPauseButton';

Enzyme.configure({ adapter: new Adapter() });

test('<PlayPauseButton/> renders with prefixed class name and DOM including children.', () => {
	const rendered = shallow(<PlayPauseButton classNamePrefix="a-" pausedContent="A" playingContent="B" label="C"/>);
	const renderedToggleButton = rendered.dive();
	expect(rendered.name()).toBe('ToggleButton');
	expect(rendered.props().label).toBe('C');
	expect(renderedToggleButton.hasClass('a-play-pause-button')).toBe(true);
	expect(renderedToggleButton.text()).toBe('B');

	const rendered2 = shallow(<PlayPauseButton pausedContent="A" playingContent="B" label="C"/>);
	const renderedToggleButton2 = rendered2.dive();
	expect(renderedToggleButton2.hasClass('v-player-play-pause-button')).toBe(true);
});

test('<PlayPauseButton/> renders paused state correctly.', () => {
	const rendered = shallow(<PlayPauseButton classNamePrefix="a-" isPaused={true} pausedContent="A" playingContent="B"/>);
	const props = rendered.props();
	const renderedToggleButton = rendered.dive();
	expect(props.isOn).toBe(true);
	expect(renderedToggleButton.text()).toBe('A');
});

test('<PlayPauseButton/> updates property isPaused with opposite boolean value on click.', () => {
	const updatePropertyCallback = jest.fn();
	const rendered = shallow(<PlayPauseButton updateProperty={updatePropertyCallback} classNamePrefix="a-" isPaused={true} pausedContent="A" playingContent="B"/>);
	const renderedToggleButton = rendered.dive();
	expect(renderedToggleButton.simulate('click'));
	expect(updatePropertyCallback.mock.calls.length).toBe(1);
	expect(updatePropertyCallback.mock.calls[0][0]).toEqual({ isPaused: false });
});