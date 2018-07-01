import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Container from './Container';

Enzyme.configure({ adapter: new Adapter() });

test('<Container/> renders with prefixed class name and DOM including children.', () => {
  const rendered = shallow(
    <Container classNamePrefix="myplayer-" className="myclassname">
      The content
    </Container>
  );
  expect(rendered.name()).toEqual('div');
  expect(rendered.hasClass('myplayer-container')).toBe(true);
  expect(rendered.hasClass('myplayer-myclassname')).toBe(true);
  expect(rendered.text()).toEqual('The content');
});

test('<Container/> renders with unprefixed container property from classes if specified.', () => {
  const rendered = shallow(
    <Container classNamePrefix="myplayer-" className="myclassname" classes={{ container: 'container-1' }}>
      The content
    </Container>
  );
  expect(rendered.name()).toEqual('div');
  expect(rendered.hasClass('myplayer-container')).toBe(false);
  expect(rendered.hasClass('myplayer-myclassname')).toBe(false);
  expect(rendered.hasClass('container-1')).toBe(true);
  expect(rendered.text()).toEqual('The content');
});
