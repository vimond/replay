import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import SkipButton from './SkipButton';

Enzyme.configure({ adapter: new Adapter() });

test('<SkipButton/> renders with prefixed class name and DOM including children.', () => {
  const rendered = shallow(<SkipButton classNamePrefix="a-" content="S" label="C" />);
  const renderedButton = rendered.dive();
  expect(rendered.name()).toBe('Button');
  expect(rendered.props().label).toBe('C');
  expect(renderedButton.hasClass('a-skip-button')).toBe(true);
  expect(renderedButton.text()).toBe('S');

  const rendered2 = shallow(<SkipButton />);
  const renderedButton2 = rendered2.dive();
  expect(renderedButton2.hasClass('replay-skip-button')).toBe(true);
});

test('<SkipButton/> invokes the setProperties callback when clicked, passing the new position calculated from adding the specified offset to the current position.', () => {
  const setPropertiesCallback = jest.fn();
  const rendered = shallow(<SkipButton setProperties={setPropertiesCallback} position={345} offset={-13} />);
  const renderedButton = rendered.dive();
  expect(renderedButton.simulate('click'));
  expect(setPropertiesCallback.mock.calls.length).toBe(1);
  expect(setPropertiesCallback.mock.calls[0][0]).toEqual({ position: 332 });
  expect(renderedButton.simulate('click'));
  expect(setPropertiesCallback.mock.calls.length).toBe(2);
  expect(setPropertiesCallback.mock.calls[0][0]).toEqual({ position: 332 });
});

test('<SkipButton/> does not invoke the setProperties callback upon click, if there is no valid position specified.', () => {
  const setPropertiesCallback = jest.fn();
  const rendered = shallow(<SkipButton setProperties={setPropertiesCallback} position={undefined} offset={-13} />);
  const renderedButton = rendered.dive();
  renderedButton.simulate('click');
  expect(setPropertiesCallback.mock.calls.length).toBe(0);
});

test('<SkipButton/> does not invoke the setProperties callback upon click, if there is no valid offset specified.', () => {
  const setPropertiesCallback = jest.fn();
  const rendered = shallow(<SkipButton setProperties={setPropertiesCallback} position={1234} offset={NaN} />);
  const renderedButton = rendered.dive();
  expect(renderedButton.simulate('click'));
  expect(setPropertiesCallback.mock.calls.length).toBe(0);
});
