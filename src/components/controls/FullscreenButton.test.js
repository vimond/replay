import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import FullscreenButton from './FullscreenButton';

Enzyme.configure({ adapter: new Adapter() });

test('<FullscreenButton/> renders with prefixed class name and DOM including children.', () => {
	const rendered = shallow(<FullscreenButton classNamePrefix="a-" fullscreenContent="A" normalContent="B" label="C"/>);
	const renderedToggleButton = rendered.dive();
	expect(rendered.name()).toBe('ToggleButton');
	expect(rendered.props().label).toBe('C');
	expect(renderedToggleButton.hasClass('a-fullscreen-button')).toBe(true);
	expect(renderedToggleButton.text()).toBe('B');

	const rendered2 = shallow(<FullscreenButton />);
	const renderedToggleButton2 = rendered2.dive();
	expect(renderedToggleButton2.hasClass('v-player-fullscreen-button')).toBe(true);
});

test('<FullscreenButton/> renders button state during fullscreen correctly.', () => {
	const rendered = shallow(<FullscreenButton classNamePrefix="a-" isFullscreen={true} fullscreenContent="A" normalContent="B"/>);
	const renderedToggleButton = rendered.dive();
	expect(rendered.props().isOn).toBe(true);
	expect(renderedToggleButton.text()).toBe('A');
});

test('<FullscreenButton/> updates property isFullscreen with opposite boolean value on click.', () => {
	const updatePropertyCallback = jest.fn();
	const rendered = shallow(<FullscreenButton updateProperty={updatePropertyCallback} classNamePrefix="a-" isFullscreen={false} fullscreenContent="A" normalContent="B"/>);
	const renderedToggleButton = rendered.dive();
	expect(renderedToggleButton.simulate('click'));
	expect(updatePropertyCallback.mock.calls.length).toBe(1);
	expect(updatePropertyCallback.mock.calls[0][0]).toEqual({ isFullscreen: true });
	expect(renderedToggleButton.simulate('click'));
	expect(updatePropertyCallback.mock.calls.length).toBe(2);
	expect(updatePropertyCallback.mock.calls[1][0]).toEqual({ isFullscreen: true }); // Prop not updated. Same outcome.
});