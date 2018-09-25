import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import PlayerController from './PlayerController';
import { ControlledVideoStreamer } from './connectControl';
import connectControl from './connectControl';

Enzyme.configure({ adapter: new Adapter() });

class MockVideo extends React.Component {
  render() {
    return <video />;
  }
}

const getMockControl = callback => {
  return props => {
    callback && callback(props);
    return <div className="control" />;
  };
};

const getMockPlayerUi = controlUpdateCallback => {
  const ConnectedControl = connectControl(getMockControl(controlUpdateCallback), ['position', 'duration']);
  return (
    <div>
      <ControlledVideoStreamer />
      <ConnectedControl />
    </div>
  );
};

const mockConfig = {
  propA: 'yes',
  propB: false,
  propC: {
    propD: 1
  },
  videoStreamer: {
    propE: 14,
    propF: {
      propG: 'perhaps'
    }
  }
};

const mockOptions = {
  propB: true,
  propC: null
};

test('<PlayerController /> renders through render prop with video streamer child.', () => {
  const renderProp = jest.fn();
  renderProp.mockReturnValue(getMockPlayerUi());
  const rendered = mount(
    <PlayerController render={renderProp}>
      <MockVideo />
    </PlayerController>
  );
  expect(renderProp.mock.calls.length).toBe(1);
  expect(rendered.find('video').length).toBe(1);
});

test('<PlayerController /> passes down props and merged configuration in the render prop call and to the video streamer.', () => {
  const renderProp = jest.fn();
  renderProp.mockReturnValue(getMockPlayerUi());
  const onStreamerError = () => {};
  const rendered = mount(
    <PlayerController
      onStreamerError={onStreamerError}
      configuration={mockConfig}
      options={mockOptions}
      render={renderProp}
      initialPlaybackProps={{ isPaused: true, volume: 0 }}
      externalProps={{ playerMode: 'full' }}>
      <MockVideo />
    </PlayerController>
  );

  const renderParameters = renderProp.mock.calls[0][0];
  const controllerApi = renderParameters.controllerApi;
  expect(renderParameters.configuration).toEqual({
    propA: 'yes',
    propB: true,
    propC: null,
    videoStreamer: {
      propE: 14,
      propF: {
        propG: 'perhaps'
      }
    }
  });
  expect(renderParameters.externalProps).toEqual({ playerMode: 'full' });
  expect(typeof controllerApi.setProperty).toBe('function');
  expect(typeof controllerApi.observe).toBe('function');
  expect(typeof controllerApi.unobserve).toBe('function');
  expect(controllerApi.inspect()).toEqual({});

  const videoStreamerProps = rendered.find('MockVideo').props();
  expect(typeof videoStreamerProps.onReady).toBe('function');
  expect(typeof videoStreamerProps.onPlaybackError).toBe('function');
  expect(videoStreamerProps.initialPlaybackProps.isPaused).toBe(true);
  expect(typeof videoStreamerProps.onStreamStateChange).toBe('function');
  expect(videoStreamerProps.configuration).toEqual({ propE: 14, propF: { propG: 'perhaps' } });
});

test('<PlayerController /> updates observers (only) when specified stream state properties change.', () => {
  const renderProp = jest.fn();
  const onConnectedControlRender = jest.fn();
  renderProp.mockReturnValue(getMockPlayerUi(onConnectedControlRender));
  const rendered = mount(
    <PlayerController render={renderProp}>
      <MockVideo />
    </PlayerController>
  );
  const onStreamStateChange = rendered.find('MockVideo').props().onStreamStateChange;

  onStreamStateChange({ position: 313 });
  rendered.update();
  expect(onConnectedControlRender.mock.calls[1][0].position).toEqual(313);

  onStreamStateChange({ playMode: 'ondemand' });
  rendered.update();
  expect(onConnectedControlRender.mock.calls.length).toBe(2);

  onStreamStateChange({ duration: 4567 });
  rendered.update();
  expect(onConnectedControlRender.mock.calls[2][0].duration).toEqual(4567);

  onStreamStateChange({ position: 22 });
  rendered.update();
  expect(onConnectedControlRender.mock.calls[3][0].position).toEqual(22);
});

test("<PlayerController /> invokes videoStreamer's setProperty when setProperty() is invoked and videoStreamer is ready.", () => {
  const renderProp = jest.fn();
  const setProperty = jest.fn();
  renderProp.mockReturnValue(getMockPlayerUi());
  const rendered = mount(
    <PlayerController render={renderProp}>
      <MockVideo />
    </PlayerController>
  );
  const videoStreamerProps = rendered.find('MockVideo').props();
  videoStreamerProps.onReady({ setProperty });
  const controllerApi = renderProp.mock.calls[1][0].controllerApi;
  controllerApi.setProperty({ volume: 0.75 });
  controllerApi.setProperty({ volume: 0.1 });
  controllerApi.setProperty({ volume: 0.1 });
  expect(setProperty.mock.calls[0][0].volume).toBe(0.75);
  //expect(setProperty.mock.calls[1][0].volume).toBe(0.1);
  //expect(setProperty.mock.calls[2][0].volume).toBe(0.1);
});
