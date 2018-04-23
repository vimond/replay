import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import GotoLiveButton from './GotoLiveButton';

Enzyme.configure({ adapter: new Adapter() });

test('GotoLiveButton renders with prefixed class name and DOM including children.', () => {
	const rendered = shallow(<GotoLiveButton classNamePrefix="a-" isAtLivePositionContent="A" isNotAtLivePositionContent="B" label="C"/>);
	const renderedToggleButton = rendered.dive();
	expect(rendered.name()).toBe('ToggleButton');
	expect(rendered.props().label).toBe('C');
	expect(renderedToggleButton.hasClass('a-goto-live-button')).toBe(true);
	expect(renderedToggleButton.text()).toBe('B');

	const rendered2 = shallow(<GotoLiveButton />);
	const renderedToggleButton2 = rendered2.dive();
	expect(renderedToggleButton2.hasClass('v-player-goto-live-button')).toBe(true);
});

test('GotoLiveButton renders button state when live correctly.', () => {
	const rendered = shallow(<GotoLiveButton classNamePrefix="a-" isAtLivePosition={true} isAtLivePositionContent="A" isNotAtLivePositionContent="B"/>);
	const renderedToggleButton = rendered.dive();
	expect(rendered.props().isOn).toBe(true);
	expect(renderedToggleButton.text()).toBe('A');
});

test('GotoLiveButton invokes the gotoLive() callback when clicked, and not at live position.', () => {
	const gotoLiveCallback = jest.fn();
	const rendered = shallow(<GotoLiveButton gotoLive={gotoLiveCallback} isAtLivePosition={false}/>);
	expect(rendered.props().isOn).toBe(false);
	const renderedToggleButton = rendered.dive();
	expect(renderedToggleButton.simulate('click'));
	expect(gotoLiveCallback.mock.calls.length).toBe(1);
	expect(gotoLiveCallback.mock.calls[0][0]).toBe();
});

test('GotoLiveButton does not invoke the gotoLive() callback when clicked, if already at live position.', () => {
	const gotoLiveCallback = jest.fn();
	const rendered = shallow(<GotoLiveButton gotoLive={gotoLiveCallback} isAtLivePosition={true}/>);
	expect(rendered.props().isOn).toBe(true);
	const renderedToggleButton = rendered.dive();
	expect(renderedToggleButton.simulate('click'));
	expect(gotoLiveCallback.mock.calls.length).toBe(0);
});
