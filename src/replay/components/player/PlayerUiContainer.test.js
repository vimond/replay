import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import PlayerUiContainer from './PlayerUiContainer';

Enzyme.configure({ adapter: new Adapter() });

const render = jest.fn();

const playerUiContainerProps = {
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

test('<PlayerUiContainer/> renders with prefixed class name and DOM including children.', () => {
  const rendered = mount(<PlayerUiContainer {...playerUiContainerProps} />);
  const aspectRatio = rendered.find('AspectRatio');
  expect(aspectRatio.props().aspectRatio).toBe(playerUiContainerProps.aspectRatio);
  const fullscreen = rendered.find('Fullscreen');
  expect(typeof fullscreen.props().render).toBe('function');
  const interactionDetector = rendered.find('InteractionDetector');
  expect(interactionDetector.props().configuration).toBe(playerUiContainerProps.configuration);
  const keyboardShortcuts = rendered.find('KeyboardShortcuts');
  expect(keyboardShortcuts.props().configuration).toBe(playerUiContainerProps.configuration);
  const playerStateClassNames = rendered.find('PlayerStateClassNames');
  expect(playerStateClassNames.props().classNamePrefix).toBe('a-');
  const deepDiv = playerStateClassNames.find('div');
  expect(deepDiv.props().tabIndex).toBe(1);
  expect(playerUiContainerProps.render.mock.calls.length).toBeGreaterThan(0);
  expect(Object.keys(playerUiContainerProps.render.mock.calls[0][0])).toContain('fullscreenState');
  expect(Object.keys(playerUiContainerProps.render.mock.calls[0][0])).toContain('interactionState');
});
