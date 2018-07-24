import { Components, Replay } from './index';
import React, { Component } from 'react';

import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

test('Entry point exposes both the player and the components.', () => {
  expect(typeof Replay).toBe('function');
  expect(typeof Components.PlayPauseButton).toBe('function');
  expect(typeof Components.PlayerController).toBe('function');
});

test('Replay renders', () => {
  const rendered = shallow(<Replay source={{ streamUrl: 'https://example.com/path/file.mp4'}} />);
  expect(rendered).toBeDefined();
});