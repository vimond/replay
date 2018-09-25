import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import KeyboardShortcuts from './KeyboardShortcuts';

Enzyme.configure({ adapter: new Adapter() });

const config = {
  keyboardShortcuts: {
    keyMap: {
      togglePause: ['A', 'B'],
      toggleFullscreen: 'C',
      toggleMute: ['D', 'E'],
      skipBack: 'F',
      skipForward: 'G',
      decreaseVolume: 'H',
      increaseVolume: 'I'
    },
    skipOffset: 20,
    volumeStep: 0.05
  }
};

const preventDefault = () => {};

test('<KeyboardShortcuts/> renders and invokes render prop.', () => {
  const renderFn = jest.fn();
  renderFn.mockReturnValue('Inner content');
  const rendered = shallow(<KeyboardShortcuts render={renderFn} />);
  expect(rendered.text()).toBe('Inner content');
  expect(renderFn.mock.calls.length).toBe(1);
});

const renderAndPressKey = (isUpdatingFullscreenState, prop, initialValue, key) => {
  const renderFn = jest.fn();
  renderFn.mockReturnValue('Inner content');
  const setProperty = jest.fn();
  const state = {
    fullscreenState: {
      setProperty
    },
    setProperty
  };
  if (isUpdatingFullscreenState) {
    if (Array.isArray(prop)) {
      prop.forEach((p, i) => (state.fullscreenState[p] = initialValue[i]));
    } else {
      state.fullscreenState[prop] = initialValue;
    }
  } else {
    if (Array.isArray(prop)) {
      prop.forEach((p, i) => (state[p] = initialValue[i]));
    } else {
      state[prop] = initialValue;
    }
  }

  shallow(<KeyboardShortcuts render={renderFn} configuration={config} {...state} />);
  const { handleKeyDown } = renderFn.mock.calls[0][0];
  handleKeyDown({ key, preventDefault });
  return {
    setProperty
  };
};

test('<KeyboardShortcuts/> toggles pause when mapped key is pressed and previous state was play', () => {
  const prop = 'isPaused';
  const { setProperty } = renderAndPressKey(false, prop, false, 'A');
  expect(setProperty.mock.calls[0][0]).toEqual({ isPaused: true });
  const setProperty2 = renderAndPressKey(false, prop, true, 'B').setProperty;
  expect(setProperty2.mock.calls[0][0]).toEqual({ isPaused: false });
});

test('<KeyboardShortcuts/> toggles mute when mapped key is pressed.', () => {
  const prop = 'isMuted';
  const { setProperty } = renderAndPressKey(false, prop, false, 'E');
  expect(setProperty.mock.calls[0][0]).toEqual({ isMuted: true });
  const setProperty2 = renderAndPressKey(false, prop, true, 'E').setProperty;
  expect(setProperty2.mock.calls[0][0]).toEqual({ isMuted: false });
});

test('<KeyboardShortcuts/> toggles fullscreen when mapped key is pressed.', () => {
  const prop = 'isFullscreen';
  const { setProperty } = renderAndPressKey(true, prop, true, 'C');
  expect(setProperty.mock.calls[0][0]).toEqual({ isFullscreen: false });
  const setProperty2 = renderAndPressKey(true, prop, false, 'C').setProperty;
  expect(setProperty2.mock.calls[0][0]).toEqual({ isFullscreen: true });
});

test('<KeyboardShortcuts/> does not invoke any updating if the key code is not defined in the config.', () => {
  const prop = 'isFullscreen';
  const { setProperty } = renderAndPressKey(true, prop, true, 'Enter');
  expect(setProperty.mock.calls.length).toEqual(0);
});

test('<KeyboardShortcuts/> increases or decreases volume when mapped keys are pressed.', () => {
  const prop = 'volume';
  const { setProperty } = renderAndPressKey(false, prop, 0.65, 'H');
  expect(setProperty.mock.calls[0][0].volume).toBeCloseTo(0.6);
  const setProperty2 = renderAndPressKey(false, prop, 0.65, 'I').setProperty;
  expect(setProperty2.mock.calls[0][0].volume).toBeCloseTo(0.7);
});

test("<KeyboardShortcuts/> doesn't increase volume above 1 or decrease below 0.", () => {
  const prop = 'volume';
  const { setProperty } = renderAndPressKey(false, prop, 0.03, 'H');
  expect(setProperty.mock.calls[0][0].volume).toBe(0);
  const setProperty2 = renderAndPressKey(false, prop, 0.98, 'I').setProperty;
  expect(setProperty2.mock.calls[0][0].volume).toBe(1);
});

test('<KeyboardShortcuts/> skips back or forward the configured amount of seconds, when mapped keys are pressed.', () => {
  const prop = ['position', 'duration', 'playMode'];
  const { setProperty } = renderAndPressKey(false, prop, [13, 123, 'live'], 'G');
  expect(setProperty.mock.calls[0][0]).toEqual({ position: 33 });
  const setProperty2 = renderAndPressKey(false, prop, [56, 123], 'F').setProperty;
  expect(setProperty2.mock.calls[0][0]).toEqual({ position: 36 });
});

test('<KeyboardShortcuts/> does not skip back to positions below 0.', () => {
  const prop = ['position', 'duration', 'playMode'];
  const { setProperty } = renderAndPressKey(false, prop, [13, 123, 'ondemand'], 'F');
  expect(setProperty.mock.calls[0][0]).toEqual({ position: 0 });
});

test('<KeyboardShortcuts/> does not skip forward to positions above the full duration, and for on demand streams not to the very end.', () => {
  const prop = ['position', 'duration', 'playMode'];
  const { setProperty } = renderAndPressKey(false, prop, [110, 123, 'livedvr'], 'G');
  expect(setProperty.mock.calls[0][0]).toEqual({ position: 123 });
  const setProperty2 = renderAndPressKey(false, prop, [110, 123, 'ondemand'], 'G').setProperty;
  expect(setProperty2.mock.calls.length).toBe(0);
});

test('<KeyboardShortcuts/> nudges the user activity state when a valid key is pressed. It also prevents default event handling.', () => {
  const renderFn = jest.fn();
  const nudge = jest.fn();
  const preventDefault = jest.fn();
  renderFn.mockReturnValue('Inner content');
  const videoStreamState = {
    setProperty: () => {}
  };
  const fullscreenState = {
    setProperty: () => {}
  };
  shallow(
    <KeyboardShortcuts
      nudge={nudge}
      configuration={config}
      render={renderFn}
      videoStreamState={videoStreamState}
      fullscreenState={fullscreenState}
    />
  );
  const { handleKeyDown } = renderFn.mock.calls[0][0];
  handleKeyDown({ key: 'A', preventDefault });
  handleKeyDown({ key: 'Enter', preventDefault });
  handleKeyDown({ key: 'ArrowUp', preventDefault });
  handleKeyDown({ key: 'H', preventDefault });
  expect(nudge.mock.calls.length).toBe(2);
  expect(preventDefault.mock.calls.length).toBe(2);
});
