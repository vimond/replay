import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ControlsBar from './ControlsBar';

Enzyme.configure({ adapter: new Adapter() });

test('<ControlsBar/> renders with prefixed class name and DOM including children.', () => {
    const rendered = shallow(<ControlsBar classNamePrefix="myplayer-" className="myclassname">Hello</ControlsBar>);
    expect(rendered.name()).toEqual('div');
    expect(rendered.hasClass('myplayer-controls-bar')).toBe(true);
    expect(rendered.hasClass('myplayer-myclassname')).toBe(true);
    expect(rendered.hasClass('myplayer-container')).toBe(false);
    expect(rendered.text()).toEqual('Hello');
});