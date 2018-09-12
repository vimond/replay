import getAudioTrackManager from './audioTrackManager';

const getVideoElementMock = () => {
  const handlers = {};
  let audioTracks = [];
  audioTracks.addEventListener = (eventName, listener) => {
    if (handlers[eventName]) {
      throw new Error('Already added event listener.');
    } else {
      handlers[eventName] = listener;
    }
  };
  audioTracks.removeEventListener = (eventName, listener) => {
    if (handlers[eventName] !== listener) {
      throw new Error('Event listener not added.');
    } else {
      delete handlers[eventName];
    }
  };

  return {
    videoElement: {
      audioTracks
    },
    updateAudioTracks: tracks => {
      audioTracks.length = 0;
      audioTracks.push(...tracks);
      handlers['addtrack']();
    },
    notifyChange: () => {
      handlers['change']();
    }
  };
};

test('Audio track list is filled with items from the video element when track changes are reported.', () => {
  const { videoElement, updateAudioTracks } = getVideoElementMock();
  const update = jest.fn();
  getAudioTrackManager(videoElement, update);
  updateAudioTracks([
    { id: '1', language: 'en', label: 'English' },
    { id: '2', language: 'en', kind: 'commentary' },
    { label: 'Music', kind: 'music', enabled: true }
  ]);
  expect(update).toHaveBeenCalledWith({
    audioTracks: [],
    currentAudioTrack: null
  });
  expect(update).toHaveBeenLastCalledWith({
    audioTracks: [
      { id: '1', language: 'en', kind: '', label: 'English', origin: 'in-stream' },
      { id: '2', language: 'en', kind: 'commentary', label: '', origin: 'in-stream' },
      { id: 'audio-1', language: '', kind: 'music', label: 'Music', origin: 'in-stream' }
    ],
    currentAudioTrack: { id: 'audio-1', language: '', kind: 'music', label: 'Music', origin: 'in-stream' }
  });
});

test('Audio tracks list is cleaned up when the playback source is changed.', () => {
  const { videoElement, updateAudioTracks } = getVideoElementMock();
  const update = jest.fn();
  const audioTrackManager = getAudioTrackManager(videoElement, update);
  updateAudioTracks([
    { id: '1', language: 'en', label: 'English' },
    { id: '2', language: 'en', kind: 'commentary' },
    { label: 'Music', kind: 'music', enabled: true }
  ]);
  videoElement.audioTracks.length = 0;
  audioTrackManager.handleSourceChange();
  expect(update).toHaveBeenLastCalledWith({
    audioTracks: [],
    currentAudioTrack: null
  });
});

test('When specifying an audio track to be selected, its underlying enabled property is set to true.', () => {
  const { videoElement, updateAudioTracks, notifyChange } = getVideoElementMock();
  const update = jest.fn();
  const audioTrackManager = getAudioTrackManager(videoElement, update);
  updateAudioTracks([
    { id: '1', language: 'en', label: 'English' },
    { id: '2', language: 'en', kind: 'commentary' },
    { label: 'Music', kind: 'music', enabled: true }
  ]);
  const selectableTracks = update.mock.calls[update.mock.calls.length - 1][0].audioTracks;
  audioTrackManager.handleSelectedAudioTrackChange(selectableTracks[1]);
  notifyChange();
  expect(update.mock.calls[update.mock.calls.length - 1][0]).toMatchObject({
    currentAudioTrack: { id: '2', language: 'en', kind: 'commentary', label: '', origin: 'in-stream' }
  });
});

test('When specifying no audio track (null) to be selected, no changes happen to what track being played.', () => {
  const { videoElement, updateAudioTracks, notifyChange } = getVideoElementMock();
  const update = jest.fn();
  const audioTrackManager = getAudioTrackManager(videoElement, update);
  updateAudioTracks([
    { id: '1', language: 'en', label: 'English', enabled: true },
    { id: '2', language: 'en', kind: 'commentary' }
  ]);
  audioTrackManager.handleSelectedAudioTrackChange(null);
  // notifyChange();
  expect(update).toHaveBeenLastCalledWith({
    audioTracks: [
      { id: '1', language: 'en', kind: '', label: 'English', origin: 'in-stream' },
      { id: '2', language: 'en', kind: 'commentary', label: '', origin: 'in-stream' }
    ],
    currentAudioTrack: { id: '1', language: 'en', kind: '', label: 'English', origin: 'in-stream' }
  });
});
