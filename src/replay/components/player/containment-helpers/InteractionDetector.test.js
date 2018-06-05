import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import InteractionDetector from './InteractionDetector';

Enzyme.configure({ adapter: new Adapter() });

const getRenderFn = (callbacks, done) => {
  return params => {
    const callback = callbacks.shift();
    if (callbacks.length === 0) {
      try {
        callback(params);
        done();
      } catch (e) {
        done.fail(e);
      }
    } else {
      try {
        callback(params);
      } catch (e) {
        done.fail(e);
      }
    }
    return 'Inner content';
  };
};

test('<InteractionDetector/> renders with initial state active and invokes render prop.', () => {
  const renderFn = jest.fn();
  renderFn.mockReturnValue('Inner content');
  const rendered = shallow(<InteractionDetector render={renderFn} />);
  expect(rendered.text()).toBe('Inner content');
  expect(renderFn.mock.calls.length).toBe(1);
  expect(renderFn.mock.calls[0][0].isUserActive).toBe(true);
});

test('<InteractionDetector/> reports inactive after the configured number of seconds.', done => {
  const renderTest1 = ({ isUserActive }) => {
    expect(isUserActive).toBe(true);
  };
  const renderTest2 = ({ isUserActive }) => {
    expect(isUserActive).toBe(false);
  };
  const renderFn = getRenderFn([renderTest1, renderTest2], done);
  mount(<InteractionDetector render={renderFn} configuration={{ interactionDetector: { inactivityDelay: 0.001 } }} />);
});

test('<InteractionDetector/> reports active upon mouse move or touch, or when nudged.', done => {
  const dummyCallback = () => {};
  const renderHandleMouseMove = ({ handleMouseMove, isUserActive }) => {
    // Expected state before moving mouse:
    expect(isUserActive).toBe(false);
    handleMouseMove({ clientX: 123, clientY: 678 });
  };
  const renderHandleTouchStart = ({ handleTouchStart, isUserActive }) => {
    expect(isUserActive).toBe(false);
    handleTouchStart();
  };
  const renderHandleTouchEnd = ({ handleTouchEnd, isUserActive }) => {
    // The user is still touching.
    expect(isUserActive).toBe(true);
    handleTouchEnd();
  };
  const renderHandleNudge = ({ nudge, isUserActive }) => {
    expect(isUserActive).toBe(false);
    nudge();
  };
  const renderTestTrue = ({ isUserActive }) => {
    expect(isUserActive).toBe(true);
  };
  const renderTestFalse = ({ isUserActive }) => {
    expect(isUserActive).toBe(false);
  };

  const renderFn = getRenderFn(
    [
      dummyCallback,
      renderHandleMouseMove,
      renderTestTrue,
      renderHandleTouchStart,
      renderHandleTouchEnd,
      renderHandleNudge,
      renderTestTrue,
      renderTestFalse
    ],
    done
  );
  mount(<InteractionDetector render={renderFn} configuration={{ interactionDetector: { inactivityDelay: 0.001 } }} />);
});

// Too unreliable.
test.skip('<InteractionDetector/> reports inactive again after the configured number of seconds.', done => {
  const startTime = new Date();
  const renderFns = [
    () => {},
    () => {
      const endTime = new Date();
      expect(endTime.getTime() - startTime.getTime()).toBeGreaterThan(500);
    }
  ];
  mount(
    <InteractionDetector
      render={getRenderFn(renderFns, done)}
      configuration={{ interactionDetector: { inactivityDelay: 0.5 } }}
    />
  );
});
