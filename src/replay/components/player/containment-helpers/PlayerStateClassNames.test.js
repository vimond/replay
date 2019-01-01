import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import PlayerStateClassNames from './PlayerStateClassNames';

Enzyme.configure({ adapter: new Adapter() });

const classNameDefinitions = {
  volumePrefix: 'volume-level-',
  isFullscreen: 'is-fullscreen',
  isUserInactive: 'is-user-inactive',
  isPaused: 'is-paused'
};

const state = {
  isPaused: true,
  playState: 'buffering',
  volume: 0.2,
  isFullscreen: true,
  isUserActive: false
};

test('<PlayerStateClassNames/> renders with the child control having className filled based on the state.', () => {
  const handleClick = () => {};
  const rendered = shallow(
    <PlayerStateClassNames
      classNamePrefix="a-"
      className="b"
      classNameDefinitions={classNameDefinitions}
      {...state}
      render={className => (
        <div className={className} onClick={handleClick} id="test">
          Test
        </div>
      )}
    />
  );

  expect(rendered.name()).toBe('div');
  expect(rendered.prop('id')).toBe('test');
  expect(rendered.prop('onClick')).toBe(handleClick);
  expect(rendered.hasClass('a-is-paused')).toBe(true);
  expect(rendered.hasClass('a-volume-level-low')).toBe(true);
  expect(rendered.hasClass('a-is-fullscreen')).toBe(true);
  expect(rendered.hasClass('a-is-user-inactive')).toBe(true);
});
