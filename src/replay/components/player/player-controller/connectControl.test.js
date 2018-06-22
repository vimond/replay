import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ControllerContext from './ControllerContext';
import connectControl, { ControlledVideoStreamer } from './connectControl';

Enzyme.configure({ adapter: new Adapter() });

const setup = () => {
  const onControlARender = jest.fn();
  const onControlBRender = jest.fn();
  const mockObserve = jest.fn();

  const ObservingControlA = props => {
    onControlARender(props);
    return <div id="hello">{props.text}</div>;
  };
  
  ObservingControlA.streamStateKeysForObservation = ['position', 'isPaused'];

  const ObservingControlB = props => {
    onControlBRender(props);
    return <div id="hello" />;
  };

  ObservingControlB.streamStateKeysForObservation = ['playState'];
  
  const ConnectedA = connectControl(ObservingControlA);
  const ConnectedB = connectControl(ObservingControlB);
  
  class RenderTree extends React.Component {
    render() {
      return (
        <div>
          <ControllerContext.Provider value={this.props.contextValue}>
            <div>
              <ControlledVideoStreamer/>
              <ConnectedA text="A text" />
              <ConnectedB />
            </div>
          </ControllerContext.Provider>
        </div>
      );
    }
  }

  const contextValue = { gotoLive: () => {}, setPosition: () => {}, updateProperty: () => {}, inspect: () => {}};
  const observeMethods = { observe: mockObserve, unobserve: () => {} };
  return {
    contextValue,
    observeMethods,
    onControlARender,
    onControlBRender,
    mockObserve,
    RenderTree
  };
};
//          

test('connectControl() returns a Control with controller props passed down.', () => {
  const { RenderTree, onControlARender, onControlBRender, contextValue, observeMethods } = setup();
  mount(<RenderTree contextValue={{ ...observeMethods, ...contextValue }} />);
  expect(onControlARender.mock.calls[0][0]).toEqual({ text: 'A text', ...contextValue });
  expect(onControlBRender.mock.calls[0][0]).toEqual(contextValue);
});

test('The connected control register properties to be observed by key.', () => {
  const { RenderTree, mockObserve, contextValue, observeMethods } = setup();
  mount(<RenderTree contextValue={{ ...observeMethods, ...contextValue }} />);
  let registeredProps = ['isPaused', 'playState', 'position'];
  mockObserve.mock.calls.forEach(call => {
    const foundIndex = registeredProps.indexOf(call[0]);
    registeredProps.splice(foundIndex, 1);
    expect(foundIndex).toBeGreaterThanOrEqual(0);
    expect(typeof call[1]).toBe('function');
  });
});
test('The connected controls are rerendered when the context value is updated.', () => {
  const { RenderTree, onControlARender, onControlBRender, contextValue, observeMethods } = setup();
  const renderedTree = mount(<RenderTree contextValue={{ videoStreamer: null, ...observeMethods, ...contextValue }} />);
  expect(onControlARender.mock.calls.length).toBe(1);
  expect(onControlBRender.mock.calls.length).toBe(1);
  renderedTree.setProps({ ...observeMethods, ...contextValue, videoStreamer: <div id="videoStreamer">Yes video.</div> });
  renderedTree.update();
  expect(onControlARender.mock.calls.length).toBe(2);
  expect(onControlBRender.mock.calls.length).toBe(2);
  expect(onControlBRender.mock.calls[1][0]).toEqual(contextValue);
});

test('The connected controls are rerendered when the context value is updated.', () => {
  const { RenderTree, onControlARender, onControlBRender, contextValue, observeMethods, mockObserve } = setup();
  mount(<RenderTree contextValue={{ videoStreamer: null, ...observeMethods, ...contextValue }} />);
  const updaters = {};
  mockObserve.mock.calls.forEach(call => {
    updaters[call[0]] = call[1];
  });
  expect(onControlARender.mock.calls.length).toBe(1);
  expect(onControlBRender.mock.calls.length).toBe(1);
  
  updaters['isPaused']({ isPaused: false });
  expect(onControlARender.mock.calls.length).toBe(2);
  expect(onControlARender.mock.calls[1][0]).toMatchObject({ isPaused: false });
  expect(onControlBRender.mock.calls.length).toBe(1);
  
  updaters['playState']({ playState: 'starting' });
  expect(onControlBRender.mock.calls[1][0]).toMatchObject({ playState: 'starting' });
  expect(onControlARender.mock.calls.length).toBe(2);
  
  updaters['position']({ position: 313 });
  expect(onControlARender.mock.calls[2][0]).toMatchObject({ position: 313 });
  expect(onControlBRender.mock.calls.length).toBe(2);
  expect(onControlARender.mock.calls.length).toBe(3);
});

test('<ControlledVideoStreamer/> renders the videoStreamer element provided to the context.', () => {
  const { RenderTree, contextValue, observeMethods } = setup();
  const renderedTree = mount(<RenderTree contextValue={{ videoStreamer: <video id="videoStreamer"/>, ...observeMethods, ...contextValue }} />);
  expect(renderedTree.find('video').props().id).toBe('videoStreamer');
});
