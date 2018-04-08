import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import PlayerHost from './PlayerHost';

Enzyme.configure({ adapter: new Adapter() });

test('PlayerHost renders with prefixed class name and DOM including children.', () => {
    const rendered = shallow(<PlayerHost classNamePrefix="myplayer-" className="myclassname">Hello</PlayerHost>);
    expect(rendered.name()).toEqual('div');
    expect(rendered.hasClass('myplayer-player-host')).toBe(true);
    expect(rendered.hasClass('myplayer-myclassname')).toBe(true);
    expect(rendered.hasClass('myplayer-container')).toBe(false);
    expect(rendered.text()).toEqual('Hello');
});