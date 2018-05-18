import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import AspectRatio from './AspectRatio';

Enzyme.configure({ adapter: new Adapter() });

test('<AspectRatio /> renders with DOM, class names, and styles.', () => {
  const renderFn = jest.fn();
  renderFn.mockReturnValue(<figure />);
  const rendered = shallow(<AspectRatio className="my-aspect-container" render={renderFn} />);
  expect(renderFn.mock.calls[0][0]).toEqual({
    innerStyle: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0'
    }
  });
  expect(rendered.find('div').length).toBe(2);
  expect(
    rendered
      .find('div')
      .at(0)
      .props().style
  ).toEqual({ position: 'relative' });
  expect(
    rendered
      .find('div')
      .at(0)
      .props().className
  ).toBe('my-aspect-container');
  expect(
    rendered
      .find('div')
      .at(1)
      .props().style
  ).toEqual({
    display: 'block',
    width: '100%',
    paddingTop: '56.25%'
  });
  expect(rendered.childAt(0).type()).toBe('div');
  expect(rendered.childAt(1).type()).toBe('figure');
});

test('<AspectRatio /> respects other aspect ratios than the default (16:9).', () => {
  const renderFn = jest.fn();
  renderFn.mockReturnValue(<figure />);
  const rendered = shallow(
    <AspectRatio aspectRatio={{ horizontal: 21, vertical: 9 }} className="my-aspect-container" render={renderFn} />
  );
  expect(
    rendered
      .find('div')
      .at(1)
      .props().style
  ).toEqual({
    display: 'block',
    width: '100%',
    paddingTop: '42.86%'
  });
});
