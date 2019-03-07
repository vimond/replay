import React from 'react';
import Enzyme, { mount } from 'enzyme';
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
  expect(typeof controllerApi.setProperties).toBe('function');
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
  const handleStreamStateChange = jest.fn();
  const rendered = mount(
    <PlayerController render={renderProp} onStreamStateChange={handleStreamStateChange}>
      <MockVideo />
    </PlayerController>
  );
  const onStreamStateChange = rendered.find('MockVideo').props().onStreamStateChange;

  onStreamStateChange({ position: 313 });
  rendered.update();
  expect(onConnectedControlRender.mock.calls[1][0].position).toBe(313);
  expect(handleStreamStateChange.mock.calls[0][0].position).toBe(313);

  onStreamStateChange({ playMode: 'ondemand' });
  rendered.update();
  expect(onConnectedControlRender.mock.calls.length).toBe(2);
  expect(handleStreamStateChange.mock.calls[1][0].playMode).toBe('ondemand');

  onStreamStateChange({ duration: 4567 });
  rendered.update();
  expect(onConnectedControlRender.mock.calls[2][0].duration).toBe(4567);
  expect(handleStreamStateChange.mock.calls[2][0].duration).toBe(4567);

  onStreamStateChange({ position: 22 });
  rendered.update();
  expect(onConnectedControlRender.mock.calls[3][0].position).toBe(22);
  expect(handleStreamStateChange.mock.calls[3][0].position).toBe(22);
});

test("<PlayerController /> invokes videoStreamer's setProperties when setProperties() is invoked and videoStreamer is ready.", () => {
  const renderProp = jest.fn();
  const setProperties = jest.fn();
  renderProp.mockReturnValue(getMockPlayerUi());
  const rendered = mount(
    <PlayerController render={renderProp}>
      <MockVideo />
    </PlayerController>
  );
  const videoStreamerProps = rendered.find('MockVideo').props();
  videoStreamerProps.onReady({ setProperties });
  const controllerApi = renderProp.mock.calls[1][0].controllerApi;
  controllerApi.setProperties({ volume: 0.75 });
  controllerApi.setProperties({ volume: 0.1 });
  controllerApi.setProperties({ volume: 0.1 });
  expect(setProperties.mock.calls[0][0].volume).toBe(0.75);
  expect(setProperties.mock.calls[1][0].volume).toBe(0.1);
  expect(setProperties.mock.calls[2][0].volume).toBe(0.1);
});

test("<PlayerController /> invokes videoStreamer's setProperties when playback methods are invoked and videoStreamer is ready.", () => {
  let actions;
  const renderProp = jest.fn();
  const setProperties = jest.fn();
  renderProp.mockReturnValue(getMockPlayerUi());
  const handleActionsReady = m => (actions = m);
  const rendered = mount(
    <PlayerController render={renderProp} onPlaybackActionsReady={handleActionsReady}>
      <MockVideo />
    </PlayerController>
  );
  const videoStreamerProps = rendered.find('MockVideo').props();
  videoStreamerProps.onReady({ setProperties });
  actions.play();
  actions.pause();
  actions.setPosition(101);
  actions.gotoLive();
  actions.setVolume(0.5);
  actions.setIsMuted(true);
  actions.fixBitrate('max');
  actions.capBitrate(2000);
  actions.setSelectedTextTrack({ language: 'en' });
  actions.setSelectedAudioTrack({ language: 'de' });
  actions.setSelectedTextTrack(null);
  actions.setSelectedAudioTrack(null);
  actions.showAirPlayTargetPicker();
  actions.requestPictureInPicture();
  actions.exitPictureInPicture();
  expect(setProperties.mock.calls[0][0].isPaused).toBe(false);
  expect(setProperties.mock.calls[1][0].isPaused).toBe(true);
  expect(setProperties.mock.calls[2][0].position).toBe(101);
  expect(setProperties.mock.calls[3][0].isAtLiveEdge).toBe(true);
  expect(setProperties.mock.calls[4][0].volume).toBe(0.5);
  expect(setProperties.mock.calls[5][0].isMuted).toBe(true);
  expect(setProperties.mock.calls[6][0].bitrateFix).toBe('max');
  expect(setProperties.mock.calls[7][0].bitrateCap).toBe(2000);
  expect(setProperties.mock.calls[8][0].selectedTextTrack).toEqual({ language: 'en' });
  expect(setProperties.mock.calls[9][0].selectedAudioTrack).toEqual({ language: 'de' });
  expect(setProperties.mock.calls[10][0].selectedTextTrack).toBe(null);
  expect(setProperties.mock.calls[11][0].selectedAudioTrack).toBe(null);
  expect(setProperties.mock.calls[12][0].isAirPlayTargetPickerVisible).toBe(true);
  expect(setProperties.mock.calls[13][0].isPipActive).toBe(true);
  expect(setProperties.mock.calls[14][0].isPipActive).toBe(false);
});
