import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import BasicVideoStreamer from './BasicVideoStreamer';
import { PlaybackError } from '../types';
Enzyme.configure({ adapter: new Adapter() });

// Mockifying the fairly useless jsdom HTML video element.
function getTextTracks() {
  const handlers = this.textTracksHandlers || {};
  this.textTracksHandlers = handlers;
  return {
    handlers,
    addEventListener: (eventName, listener) => {
      if (handlers[eventName]) {
        throw new Error('Already added event listener.');
      } else {
        handlers[eventName] = listener;
      }
    },
    removeEventListener: (eventName, listener) => {
      if (handlers[eventName] !== listener) {
        throw new Error('Event listener not added.');
      } else {
        delete handlers[eventName];
      }
    }
  };
}
function getAudioTracks() {
  const handlers = this.audioTracksHandlers || {};
  this.audioTracksHandlers = handlers;
  return {
    handlers,
    addEventListener: (eventName, listener) => {
      if (handlers[eventName]) {
        throw new Error('Already added event listener.');
      } else {
        handlers[eventName] = listener;
      }
    },
    removeEventListener: (eventName, listener) => {
      if (handlers[eventName] !== listener) {
        throw new Error('Event listener not added.');
      } else {
        delete handlers[eventName];
      }
    }
  };
}

Object.defineProperty(window.HTMLMediaElement.prototype, 'duration', { enumerable: true, writable: true });

Object.defineProperty(window.HTMLMediaElement.prototype, 'textTracks', {
  enumerable: true,
  get: getTextTracks
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'audioTracks', {
  enumerable: true,
  get: getAudioTracks
});

window.HTMLMediaElement.prototype.play = function() {};
window.HTMLMediaElement.prototype.pause = function() {};
window.HTMLMediaElement.prototype.load = function() {};
HTMLMediaElement.prototype.play = function() {};
HTMLMediaElement.prototype.pause = function() {};
HTMLMediaElement.prototype.load = function() {};

//Object.defineProperty(window.HTMLMediaElement.prototype, 'play', function() {});
//Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', function() {});
//Object.defineProperty(window.HTMLMediaElement.prototype, 'load', function() {});

const commonProps = {
  source: {
    streamUrl: 'http://example.com/path/file.mp4'
  },
  className: 'test-test'
};

const getPropertyUpdates = (mockFn, key) => mockFn.mock.calls.filter(call => key in call[0]).map(call => call[0]);

const domRender = (props = commonProps) => {
  return new Promise((resolve, reject) => {
    let element;
    const handleReady = ({ setProperties }) => {
      try {
        element.update();
        const videoElement = element.find('video');
        const videoRef = element.instance().videoRef;
        resolve({
          element,
          setProperties,
          videoElement,
          videoRef,
          domVideoElement: videoElement.getDOMNode()
        });
      } catch (e) {
        reject(e);
      }
    };
    element = mount(<BasicVideoStreamer {...props} onReady={handleReady} />);
  });
};

test('<BasicVideoStreamer/> renders with video element if source or stream URL is specified.', () => {
  return domRender().then(({ videoElement, domVideoElement }) => {
    expect(domVideoElement.src).toBe(commonProps.source.streamUrl);
    expect(videoElement.hasClass('replay-video-streamer')).toBe(true);
    expect(videoElement.hasClass('replay-test-test')).toBe(true);
    expect(videoElement.prop('autoPlay')).toBe(true);
    expect(videoElement.prop('controls')).toBe(false);
  });
});

test('<BasicVideoStreamer/> shuts down cleanly when source prop is removed.', () => {
  return domRender().then(({ videoElement, element, domVideoElement }) => {
    expect(domVideoElement.src).toBe(commonProps.source.streamUrl);
    element.setProps({ source: null });
    element.update();
    expect(domVideoElement.getAttribute('src')).toBe(null);
  });
});

test('<BasicVideoStreamer/> reports playback errors.', () => {
  const onPlaybackError = jest.fn();
  return domRender({ ...commonProps, onPlaybackError }).then(({ videoElement, videoRef }) => {
    const mockError = new Error('Decoding failed.');
    mockError.code = 3;
    videoRef.current.error = mockError;
    videoElement.simulate('error');

    const reportedError = onPlaybackError.mock.calls[0][0];
    expect(reportedError).toBeInstanceOf(PlaybackError);
    expect(reportedError.sourceError).toBe(mockError);
  });
});

test('<BasicVideoStreamer/> seeks to a specified startPosition upon playback start.', () => {
  const source = {
    streamUrl: commonProps.source.streamUrl,
    startPosition: 13
  };
  return domRender({ source }).then(({ videoElement, videoRef }) => {
    videoElement.simulate('loadedmetadata');
    expect(videoRef.current.currentTime).toBe(13);
  });
});

test('<BasicVideoStreamer/> respects initialPlaybackProps isMuted, volume, and isPaused at playback start.', () => {
  return domRender({
    ...commonProps,
    initialPlaybackProps: { isPaused: true, isMuted: true, volume: 0.5 }
  }).then(({ videoElement, videoRef }) => {
    const pauseSpy = jest.spyOn(videoRef.current, 'pause');

    videoElement.simulate('loadstart');
    videoElement.simulate('loadedmetadata');

    expect(videoRef.current.muted).toBe(true);
    expect(videoRef.current.volume).toBe(0.5);
    expect(pauseSpy).toHaveBeenCalledTimes(1);
  });
});

test('<BasicVideoStreamer/> handles changes to sources.', () => {});

test('<BasicVideoStreamer/> updates stream state when video element events are invoked.', () => {
  const onStreamStateChange = jest.fn();
  return domRender({ ...commonProps, onStreamStateChange }).then(({ videoElement, videoRef }) => {
    videoRef.current.duration = 313;
    videoElement.simulate('durationchange');
    videoElement.simulate('loadedmetadata');

    videoRef.current.currentTime = 123;
    videoElement.simulate('timeupdate');
    videoElement.simulate('timeupdate');

    const durationUpdates = getPropertyUpdates(onStreamStateChange, 'duration');
    expect(durationUpdates).toHaveLength(2);
    expect(durationUpdates[0]).toEqual({ duration: 0 });
    expect(durationUpdates[1]).toEqual({ duration: 313 });

    const playModeUpdates = getPropertyUpdates(onStreamStateChange, 'playMode');
    expect(playModeUpdates).toHaveLength(1);
    expect(playModeUpdates[0]).toEqual({ playMode: 'ondemand' });

    const positionUpdates = getPropertyUpdates(onStreamStateChange, 'position');
    expect(positionUpdates).toHaveLength(2);
  });
});

test('<BasicVideoStreamer/> reacts to playback props being set.', () => {
  return domRender({ ...commonProps, onStreamStateChange: () => {} }).then(({ element, videoRef, setProperties }) => {
    const playSpy = jest.spyOn(videoRef.current, 'play');
    const pauseSpy = jest.spyOn(videoRef.current, 'pause');

    expect(videoRef.current.muted).toBe(false);
    expect(videoRef.current.paused).toBe(true);

    setProperties({ isPaused: false });
    setProperties({ isPaused: true });

    setProperties({ isMuted: true });
    expect(videoRef.current.muted).toBe(true);
    setProperties({ position: 313 });
    expect(videoRef.current.currentTime).toBe(313);
    setProperties({ position: 23 });
    expect(videoRef.current.currentTime).toBe(23);
    setProperties({ volume: 0.5 });
    expect(videoRef.current.volume).toBe(0.5);

    expect(playSpy).toHaveBeenCalledTimes(1);
    expect(pauseSpy).toHaveBeenCalledTimes(1);
  });
});

// TODO [TEST]: Remaining integration tests.

describe.skip('<BasicVideoStreamer/> subtitles support', () => {
  test('<BasicVideoStreamer/> adds text tracks with cues when VTT file is specified as source track.', () => {});
  test('<BasicVideoStreamer/> "removes" old text tracks if new ones are set through the textTracks property.', () => {});
  test('<BasicVideoStreamer/> changes visibility to the text tracks according to the selectedTextTrack property', () => {});
});

describe.skip('<BasicVideoStreamer/> live streaming (with Safari and HLS)', () => {
  test('<BasicVideoStreamer/> reports playMode "livedvr" and the DVR duration of a live stream with a DVR window longer than 100 seconds.', () => {});
  test('<BasicVideoStreamer/> reports playMode "live" of a live stream with a DVR window shorter than 100 seconds.', () => {});
  test('<BasicVideoStreamer/> reports true for isAtLiveEdge for a live stream playing at the live edge.', () => {});
  test('<BasicVideoStreamer/> reports false for isAtLiveEdge for a timeshifted live stream.', () => {});
  test('<BasicVideoStreamer/> resumes playback at the live edge when { isAtLiveEdge: true } is set on a timeshifted live stream.', () => {});
  test('<BasicVideoStreamer/> reports absolutePosition and absoluteStartPosition for the current playback position of a live stream.', () => {});
});

describe.skip('<BasicVideoStreamer/> audio track support', () => {
  test('<BasicVideoStreamer/> lists audio tracks reported from the source.', () => {});
  test('<BasicVideoStreamer/> changes the audible track when the selecedAudioTrack is set/changed.', () => {});
});
