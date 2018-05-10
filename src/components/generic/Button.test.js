import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Button from './Button';

Enzyme.configure({ adapter: new Adapter() });

test('<Button/> renders with prefixed class name and DOM.', () => {
    const rendered = shallow(<Button classNamePrefix="myplayer-" label="My button" className="myclassname" content="Click me!"/>);
    expect(rendered.name()).toEqual('div');
    expect(rendered.hasClass('myplayer-button')).toBe(true);
    expect(rendered.hasClass('myplayer-myclassname')).toBe(true);
    expect(rendered.props().title).toEqual('My button');
    expect(rendered.text()).toEqual('Click me!');
});

test('<Button/> invokes a callback when clicked', () => {
    const handleClick = jest.fn();
    const rendered = shallow(<Button onClick={handleClick} classNamePrefix="myplayer-" className="myclassname" content="Click me!"/>);
    rendered.simulate('click');
    expect(handleClick).toHaveBeenCalled();
});
