import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Replay from './Replay';

Enzyme.configure({ adapter: new Adapter() });

test('<Replay/> renders and recognises the specified props.', () => {
  const props = {
    options: { setting: 'value' },
    source: { streamUrl: 'https://example.com/video.mp4' },
    textTracks: [],
    onError: () => {},
    onExit: () => {}
  };

  const MyStreamer = () => <video />;

  const rendered = mount(
    <Replay {...props}>
      <MyStreamer />
    </Replay>
  );

  const playerController = rendered.find('PlayerController');
  expect(playerController.props().onStreamerError).toBe(props.onError);
  expect(playerController.props().options).toBe(props.options);
  expect(playerController.props().externalProps.onExit).toBe(props.onExit);

  const controlledVideoStreamer = rendered.find('MyStreamer');
  expect(controlledVideoStreamer.props().source.streamUrl).toBe('https://example.com/video.mp4');
  expect(controlledVideoStreamer.props().textTracks).toBe(props.textTracks);
  expect(controlledVideoStreamer.props().onPlaybackError).toBe(props.onError);
});
