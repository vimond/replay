import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ToggleButton from './ToggleButton';

Enzyme.configure({ adapter: new Adapter() });

test('<ToggleButton/> renders with prefixed class name and DOM.', () => {
    const rendered = shallow(<ToggleButton isOn={false} classNamePrefix="myplayer-" label="My toggle button" className="myclassname" toggledOffContent="Off" toggledOnContent="On"/>);
    expect(rendered.name()).toEqual('div');
    expect(rendered.hasClass('myplayer-toggle-button')).toBe(true);
    expect(rendered.hasClass('myplayer-myclassname')).toBe(true);
    expect(rendered.hasClass('myplayer-toggled-off')).toBe(true);
    expect(rendered.hasClass('myplayer-toggled-on')).toBe(false);
    expect(rendered.props().title).toEqual('My toggle button');
    expect(rendered.text()).toEqual('Off');
});

test('<ToggleButton/> renders different the specified inner content when toggled or not toggled.', () => {
    const rendered = shallow(<ToggleButton isOn={true} classNamePrefix="myplayer-" className="myclassname" toggledOffContent="Off" toggledOnContent="On"/>);
    expect(rendered.hasClass('myplayer-toggle-button')).toBe(true);
    expect(rendered.hasClass('myplayer-myclassname')).toBe(true);
    expect(rendered.hasClass('myplayer-toggled-off')).toBe(false);
    expect(rendered.hasClass('myplayer-toggled-on')).toBe(true);
    expect(rendered.text()).toEqual('On');
});

test('<ToggleButton/> invokes a callback passing true when toggled from off to on.', () => {
    const toggleCallback = jest.fn();
    const rendered = shallow(<ToggleButton onToggle={toggleCallback} isOn={false} classNamePrefix="myplayer-" className="myclassname" toggledOffContent="Off" toggledOnContent="On"/>);
    rendered.simulate('click');
    expect(toggleCallback).toHaveBeenCalledWith(true);
});

test('<ToggleButton/> invokes a callback passing false when toggled from on to off.', () => {
    const toggleCallback = jest.fn();
    const rendered = shallow(<ToggleButton onToggle={toggleCallback} isOn={true} classNamePrefix="myplayer-" className="myclassname" toggledOffContent="Off" toggledOnContent="On"/>);
    rendered.simulate('click');
    expect(toggleCallback).toHaveBeenCalledWith(false);
});