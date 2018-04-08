import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Container from './Container';

Enzyme.configure({ adapter: new Adapter() });

test('Container renders with prefixed class name and DOM including children.', () => {
    const rendered = shallow(<Container classNamePrefix="myplayer-" className="myclassname">The content</Container>);
    expect(rendered.name()).toEqual('div');
    expect(rendered.hasClass('myplayer-container')).toBe(true);
    expect(rendered.hasClass('myplayer-myclassname')).toBe(true);
    expect(rendered.text()).toEqual('The content');
});