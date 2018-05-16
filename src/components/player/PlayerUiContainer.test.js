import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import PlayerUiContainer from './PlayerUiContainer';

Enzyme.configure({ adapter: new Adapter() });

test.skip('<PlayerUiContainer/> renders with prefixed class name and DOM including children.', () => {
    const rendered = shallow(<PlayerUiContainer classNamePrefix="myplayer-" className="myclassname">Hello</PlayerUiContainer>);
    expect(rendered.name()).toEqual('div');
    expect(rendered.hasClass('myplayer-ui-container')).toBe(true);
    expect(rendered.hasClass('myplayer-myclassname')).toBe(true);
    expect(rendered.hasClass('myplayer-container')).toBe(false);
    expect(rendered.text()).toEqual('Hello');
});