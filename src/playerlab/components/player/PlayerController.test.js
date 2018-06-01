import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import PlayerController from './PlayerController';

Enzyme.configure({ adapter: new Adapter() });

const MockStream = props => {
  const readyProps = {
    setPosition: jest.fn(),
    gotoLive: jest.fn()
  };
  setTimeout(() => props.onReady(readyProps), 20);
  return <div />;
};

test('<PlayerController/> recognizes the VideoStreamer child and invoke the render prop.', () => {
  // TODO: Write tests.
  const renderFn = jest.fn();
  const rendered = shallow(
    <PlayerController render={renderFn}>
      <MockStream />
    </PlayerController>
  );
  expect(renderFn.mock.calls.length).toBe(1);
  //expect(false).toBe(true);
});

test('<PlayerController/> passes the video stream state and update methods in the render prop call.', () => {});

test('<PlayerController/> updates the video stream props when updateProperty or other render prop callback methods are invoked.', () => {});

test('<PlayerController/> invokes the render prop method with new state when the video stream changes state.', () => {});

test('<PlayerController/> applies the config override to the base configuration and passes it to the VideoStreamer child.', () => {});
