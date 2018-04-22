import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import PlayerUiContainer from './PlayerHost';

Enzyme.configure({ adapter: new Adapter() });

test('PlayerUiContainer renders with prefixed class name and DOM including children.', () => {
    const rendered = shallow(<PlayerUiContainer classNamePrefix="myplayer-" className="myclassname">Hello</PlayerUiContainer>);
    expect(rendered.name()).toEqual('div');
    expect(rendered.hasClass('myplayer-player-host')).toBe(true);
    expect(rendered.hasClass('myplayer-myclassname')).toBe(true);
    expect(rendered.hasClass('myplayer-container')).toBe(false);
    expect(rendered.text()).toEqual('Hello');
});