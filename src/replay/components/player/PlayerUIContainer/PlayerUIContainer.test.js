import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import PlayerUIContainer from './PlayerUIContainer';

Enzyme.configure({ adapter: new Adapter() });

const render = jest.fn();

const playerUIContainerProps = {
  aspectRatio: {
    horizontal: 21,
    vertical: 9
  },
  configuration: {
    interactionDetector: { yes: 'no' },
    keyboardShortcuts: { no: false }
  },
  render,
  className: 'class-name',
  classNamePrefix: 'a-'
};

test('<PlayerUIContainer/> renders with prefixed class name and DOM including children.', () => {
  const rendered = mount(<PlayerUIContainer {...playerUIContainerProps} />);
  const aspectRatio = rendered.find('AspectRatio');
  expect(aspectRatio.props().aspectRatio).toBe(playerUIContainerProps.aspectRatio);
  const fullscreen = rendered.find('Fullscreen');
  expect(typeof fullscreen.props().render).toBe('function');
  const interactionDetector = rendered.find('InteractionDetector');
  expect(interactionDetector.props().configuration).toBe(playerUIContainerProps.configuration);
  const keyboardShortcuts = rendered.find('KeyboardShortcuts');
  expect(keyboardShortcuts.props().configuration).toBe(playerUIContainerProps.configuration);
  const playerStateClassNames = rendered.find('PlayerStateClassNames');
  expect(playerStateClassNames.props().classNamePrefix).toBe('a-');
  const deepDiv = playerStateClassNames.find('div');
  expect(deepDiv.props().tabIndex).toBe(0);
  expect(playerUIContainerProps.render.mock.calls.length).toBeGreaterThan(0);
  expect(Object.keys(playerUIContainerProps.render.mock.calls[0][0])).toContain('fullscreenState');
  expect(Object.keys(playerUIContainerProps.render.mock.calls[0][0])).toContain('interactionState');
});
