import { Components, Replay } from './index';
import { Component } from 'react';

test('Entry point exposes both the player and the components.', () => {
  expect(typeof Replay).toBe('function');
  expect(typeof Components.PlayPauseButton).toBe('function');
  expect(typeof Components.PlayerController).toBe('function');
});