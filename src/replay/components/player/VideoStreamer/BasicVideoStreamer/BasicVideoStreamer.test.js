import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import BasicVideoStreamer from './BasicVideoStreamer';
import { PlaybackError } from '../types';

Enzyme.configure({ adapter: new Adapter() });
// Mockifying the fairly useless jsdom HTML video element. 
Object.defineProperty(window.HTMLMediaElement.prototype, 'duration', { enumerable: true, writable: true });

const commonProps = {
  source: {
    streamUrl: 'http://example.com/path/file.mp4'
  },
  className: 'test-test'
};

const styles = {
  position: 'absolute',
  top: '0',
  display: 'inline-block',
  width: '100%',
  height: '100%'
};

const getPropertyUpdates = (mockFn, key) =>  mockFn.mock.calls.filter(call => key in call[0]).map(call => call[0]);

const domRender = (props = commonProps) => {
  const element = mount(<BasicVideoStreamer {...props}/>);
  const videoElement = element.find('video');
  const videoRef = element.instance().videoRef;
  return {
    element,
    videoElement,
    videoRef,
    domVideoElement: videoElement.getDOMNode() 
  };
};

test('<BasicVideoStreamer/> renders with video element if source or stream URL is specified.', () => {
  const { videoElement } = domRender();
  expect(videoElement.prop('src')).toBe(commonProps.source.streamUrl);
  // TODO: Class names vs custom styles.
  expect(videoElement.prop('style')).toMatchObject(styles);
  expect(videoElement.hasClass('replay-video-streamer')).toBe(true);
  expect(videoElement.hasClass('replay-test-test')).toBe(true);
  expect(videoElement.prop('autoPlay')).toBe(true);
  expect(videoElement.prop('controls')).toBe(false);
});

test('<BasicVideoStreamer/> shuts down cleanly when source prop is removed.', () => {
  const { videoElement, element } = domRender();
  expect(videoElement.prop('src')).toBe(commonProps.source.streamUrl);
  element.setProps({ source: null });
  element.update();
  expect(element.find('video').prop('src')).toBeUndefined();
});

test('<BasicVideoStreamer/> invokes a callback with position manipulation methods when ready.', () => {
  const onReady = jest.fn();
  const spy = jest.spyOn(BasicVideoStreamer.prototype, 'componentDidMount');
  domRender({ ...commonProps, onReady });
  expect(spy).toHaveBeenCalled();
  const onReadyMethods = onReady.mock.calls[0][0];
  expect(typeof onReadyMethods.gotoLive).toBe('function');
  expect(typeof onReadyMethods.setPosition).toBe('function');
});

test('<BasicVideoStreamer/> reports playback errors.', () => {
  const onPlaybackError = jest.fn();
  const { videoElement, videoRef } = domRender({ ...commonProps, onPlaybackError });
  const mockError = new Error('Decoding failed.');
  mockError.code = 3;
  videoRef.current.error = mockError;
  videoElement.simulate('error');
  
  const reportedError = onPlaybackError.mock.calls[0][0];
  expect(reportedError).toBeInstanceOf(PlaybackError);
  expect(reportedError.sourceError).toBe(mockError);
});

test('<BasicVideoStreamer/> seeks to a specified startPosition upon playback start.', () => {
  const source = {
    streamUrl: commonProps.source.streamUrl,
    startPosition: 13
  };
  const { videoElement, videoRef } = domRender({ source });
  videoElement.simulate('loadedmetadata');
  expect(videoRef.current.currentTime).toBe(13);
});

test('<BasicVideoStreamer/> handles changes to sources.', () => {

});


// TODO: Advanced topics for testing: 
// * Configuration
// * Progress events

describe('<BasicVideoStreamer/> stream state property updates', () => {
  test('<BasicVideoStreamer/> reports playMode "ondemand" and a duration when a video file source is loaded.', () => {
    const onStreamStateChange = jest.fn();
    const { videoElement, videoRef } = domRender({ ...commonProps, onStreamStateChange });

    videoRef.current.duration = 313;
    videoElement.simulate('durationchange');
    videoElement.simulate('loadedmetadata');
    
    const durationUpdates = getPropertyUpdates(onStreamStateChange, 'duration');
    expect(durationUpdates).toHaveLength(2);
    expect(durationUpdates[0]).toEqual({ duration: 0 });
    expect(durationUpdates[1]).toEqual({ duration: 313 });

    const playModeUpdates = getPropertyUpdates(onStreamStateChange, 'playMode');
    expect(playModeUpdates).toHaveLength(1);
    expect(playModeUpdates[0]).toEqual({ playMode: 'ondemand' });
  });
  test('<BasicVideoStreamer/> reports positions accordingly during playback.', () => {
    const onStreamStateChange = jest.fn();
    const { videoElement, videoRef } = domRender({ ...commonProps, onStreamStateChange });

    videoRef.current.currentTime = 121;
    videoElement.simulate('timeupdate');
    videoRef.current.currentTime = 123;
    videoElement.simulate('timeupdate');

    const positionUpdates = getPropertyUpdates(onStreamStateChange, 'position');
    expect(positionUpdates).toHaveLength(3);
  });
});

describe.skip('<BasicVideoStreamer/> manipulating playback properties', () => {
  test('<BasicVideoStreamer/> starts playback as paused if isPaused is set to true when setting the source.', () => {

  });
  test('<BasicVideoStreamer/> plays or pauses the video according to isPaused being set.', () => {

  });
  test('<BasicVideoStreamer/> mutes, unmutes, and adjusts the volume according to isMuted and volume properties being set.', () => {

  });
  test('<BasicVideoStreamer/> doesn\'t react on bitrate property changes.', () => {

  });
});

describe.skip('<BasicVideoStreamer/> live streaming (with Safari and HLS)', () => {
  test('<BasicVideoStreamer/> reports playMode "livedvr" and the DVR duration of a live stream with a DVR window longer than 100 seconds.', () => {

  });
  test('<BasicVideoStreamer/> reports playMode "live" of a live stream with a DVR window shorter than 100 seconds.', () => {

  });
  test('<BasicVideoStreamer/> reports true for isAtLivePosition for a live stream playing at the live edge.', () => {
    
  });
  test('<BasicVideoStreamer/> reports false for isAtLivePosition for a timeshifted live stream.', () => {

  });
  test('<BasicVideoStreamer/> resumes playback at the live edge when gotoLive() is invoked on a timeshifted live stream.', () => {

  });
  test('<BasicVideoStreamer/> reports absolutePosition and absoluteStartPosition for the current playback position of a live stream.', () => {

  });
  
});

//TODO: Advanced features

describe.skip('<BasicVideoStreamer/> subtitles support', () => {
  test('<BasicVideoStreamer/> adds text tracks with cues when VTT file is specified as source track.', () => {

  });
  test('<BasicVideoStreamer/> parses and add text tracks with cues when TTML file is specified as source track.', () => {

  });
  test('<BasicVideoStreamer/> "removes" old text tracks if new ones are set through the textTracks property.', () => {

  });
  test('<BasicVideoStreamer/> changes visibility to the text tracks according to the selectedTextTrack property', () => {

  });
});

describe.skip('<BasicVideoStreamer/> audio track support', () => {
  // TODO.
});

describe.skip('<BasicVideoStreamer/> FairPlay DRM support (Safari)', () => {
  // TODO.
});

