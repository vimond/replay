import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ExitButton from './ExitButton';

Enzyme.configure({ adapter: new Adapter() });

test('<ExitButton/> renders with prefixed class name and DOM including children.', () => {
  const rendered = shallow(<ExitButton classNamePrefix="a-" content="X" label="Exit" onClick={jest.fn()} />);
  const renderedButton = rendered.dive();
  expect(rendered.name()).toBe('Button');
  expect(rendered.props().label).toBe('Exit');
  expect(renderedButton.hasClass('a-exit-button')).toBe(true);
  expect(renderedButton.text()).toBe('X');

  const rendered2 = shallow(<ExitButton onClick={jest.fn()} />);
  const renderedButton2 = rendered2.dive();
  expect(renderedButton2.hasClass('replay-exit-button')).toBe(true);
});

test('<ExitButton/> does not render if onClick callback prop is not specified..', () => {
  const rendered = shallow(<ExitButton classNamePrefix="a-" content="X" label="Exit" />);
  expect(rendered.getElement()).toBe(null);
});

test('<ExitButton/> invokes the onClick callback when clicked.', () => {
  const onClickCallback = jest.fn();
  const rendered = shallow(<ExitButton onClick={onClickCallback} />);
  const renderedButton = rendered.dive();
  expect(renderedButton.simulate('click'));
  expect(onClickCallback.mock.calls.length).toBe(1);
  expect(renderedButton.simulate('click'));
  expect(onClickCallback.mock.calls.length).toBe(2);
});
