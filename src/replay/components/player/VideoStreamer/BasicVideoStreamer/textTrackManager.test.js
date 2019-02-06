import getTextTrackManager from './textTrackManager';

HTMLTrackElement.prototype.addEventListener = function(eventName, listener) {
  if (eventName === 'load') {
    this.loadFn = listener;
  }
};

HTMLTrackElement.prototype.track = { mode: 'disabled ' };

window.VTTCue = function(start, end, content) {
  return {
    start,
    end,
    content
  };
};

const getVideoElementMock = () => {
  const handlers = {};
  const children = [];
  const textTracks = [{ mode: 'showing' }, { mode: 'hidden' }];
  textTracks.addEventListener = (eventName, listener) => {
    if (handlers[eventName]) {
      throw new Error('Already added event listener.');
    } else {
      handlers[eventName] = listener;
    }
  };
  textTracks.removeEventListener = (eventName, listener) => {
    if (handlers[eventName] !== listener) {
      throw new Error('Event listener not added.');
    } else {
      delete handlers[eventName];
    }
  };

  return {
    textTracks,
    children,
    videoElement: {
      addTextTrack: (kind, label, language) => {
        const track = {
          kind,
          label,
          language,
          cues: [],
          addCue: cue => {
            track.cues.push(cue);
          },
          mode: 'hidden'
        };
        textTracks.push(track);
        return track;
      },
      appendChild: trackElm => {
        const track = {
          kind: trackElm.kind,
          language: trackElm.srclang,
          label: trackElm.label,
          mode: 'hidden'
        };
        trackElm.track = track;
        trackElm.loadFn();
        children.push(trackElm);
        textTracks.push(track);
      },
      textTracks
    },
    notifyTrackEventListener: () => handlers['addtrack']()
  };
};

const exampleSourceTracks1 = [
  {
    kind: 'subtitles',
    language: 'no',
    src: 'subtitles/a-no.vtt',
    contentType: 'text/vtt',
    label: 'A: Norwegian'
  },
  {
    kind: 'captions',
    language: 'sv',
    src: 'subtitles/b-sv.vtt',
    contentType: 'text/vtt',
    label: 'B: Swedish'
  }
];
const exampleSourceTracks2 = [
  {
    kind: 'subtitles',
    language: 'fi',
    src: 'subtitles/c-fi.vtt',
    contentType: 'text/vtt',
    label: 'C: Finnish'
  },
  {
    kind: 'subtitles',
    language: 'en',
    src: 'subtitles/d-en.vtt',
    contentType: 'text/vtt',
    label: 'D: English'
  }
];

const exampleSourceTracks3 = [
  {
    kind: 'subtitles',
    language: 'da',
    label: 'E: Danish',
    cues: [
      {
        start: 3.2,
        end: 17,
        content: 'Vi forstår hinanden ikke!'
      }
    ]
  },
  {
    kind: 'captions',
    language: 'de',
    src: 'subtitles/f-de.vtt',
    label: 'F: German',
    cues: [
      {
        start: 1,
        end: 5.5,
        content: 'Herzliche Grüße aus München'
      },
      {
        start: 13.5,
        end: 18.2,
        content: 'Wo ist das Krankenhaus?'
      }
    ]
  }
];

test('textTrackManager blacklists earlier video element text tracks upon invoking clear().', done => {
  const m = getVideoElementMock();
  const updateFn = () => {
    try {
      expect(m.videoElement.textTracks[0].mode).toBe('disabled');
      expect(m.videoElement.textTracks[1].mode).toBe('disabled');
      textTrackManager.cleanup();
      done();
    } catch (e) {
      done.fail(e);
    }
  };
  const textTrackManager = getTextTrackManager(m.videoElement, updateFn);
  expect(m.videoElement.textTracks[0].mode).toBe('showing');
  expect(m.videoElement.textTracks[1].mode).toBe('hidden');
  textTrackManager.clear();
  textTrackManager.handleSourcePropChange({ source: { streamUrl: '', textTracks: exampleSourceTracks1 } });
});

test('Tracks specified in the source property are added to the video element, and exposed as stream state properties.', done => {
  const m = getVideoElementMock();
  const updateFn = newState => {
    try {
      expect(newState.textTracks).toHaveLength(2);
      expect(newState.textTracks[0]).toMatchObject({
        language: 'no',
        kind: 'subtitles',
        label: 'A: Norwegian',
        origin: 'side-loaded'
      });
      expect(newState.textTracks[1]).toMatchObject({
        language: 'sv',
        kind: 'captions',
        label: 'B: Swedish',
        origin: 'side-loaded'
      });
      done();
    } catch (e) {
      done.fail(e);
    }
  };
  const textTrackManager = getTextTrackManager(m.videoElement, updateFn);
  textTrackManager.clear();
  textTrackManager.handleSourcePropChange({ source: { streamUrl: '', textTracks: exampleSourceTracks1 } });
});

test('textTrackManager add tracks to video element when cues are specified.', done => {
  const m = getVideoElementMock();
  const updateFn = newState => {
    try {
      expect(newState.textTracks).toHaveLength(2);
      expect(newState.textTracks[0]).toMatchObject({
        language: 'da',
        kind: 'subtitles',
        label: 'E: Danish',
        origin: 'side-loaded'
      });
      expect(newState.textTracks[1]).toMatchObject({
        language: 'de',
        kind: 'captions',
        label: 'F: German',
        origin: 'side-loaded'
      });
      expect(m.textTracks[2].cues[0]).toEqual(exampleSourceTracks3[0].cues[0]);
      expect(m.textTracks[3].cues[1]).toEqual(exampleSourceTracks3[1].cues[1]);
      done();
    } catch (e) {
      done.fail(e);
    }
  };
  const textTrackManager = getTextTrackManager(m.videoElement, updateFn);
  textTrackManager.clear();
  textTrackManager.handleSourcePropChange({ source: { streamUrl: '', textTracks: exampleSourceTracks3 } });
});

test('textTrackManager removes earlier tracks when a new set of tracks are specified through the textTracks prop.', done => {
  const firstUpdate = newState => {
    expect(newState.textTracks[0]).toMatchObject({
      language: 'no',
      kind: 'subtitles',
      label: 'A: Norwegian',
      origin: 'side-loaded'
    });
    expect(newState.textTracks[1]).toMatchObject({
      language: 'sv',
      kind: 'captions',
      label: 'B: Swedish',
      origin: 'side-loaded'
    });
    textTrackManager.handleTextTracksPropChange({
      source: { streamUrl: '', textTracks: exampleSourceTracks3 },
      textTracks: exampleSourceTracks2
    });
    //set tracks
  };

  const secondUpdate = newState => {
    try {
      expect(newState.textTracks[0]).toMatchObject({
        kind: 'subtitles',
        language: 'fi',
        label: 'C: Finnish',
        origin: 'side-loaded'
      });
      expect(newState.textTracks[1]).toMatchObject({
        kind: 'subtitles',
        language: 'en',
        label: 'D: English',
        origin: 'side-loaded'
      });
      done();
    } catch (e) {
      done.fail(e);
    }
  };

  const updateFns = [secondUpdate, firstUpdate];
  const m = getVideoElementMock();
  const updateFn = newState => {
    updateFns.pop()(newState);
  };
  const textTrackManager = getTextTrackManager(m.videoElement, updateFn);
  textTrackManager.clear();
  textTrackManager.handleSourcePropChange({ source: { streamUrl: '', textTracks: exampleSourceTracks1 } });
});

test(
  'textTrackManager updates a video element text track\'s mode to "showing" when an available track ' +
    'is specified as selected. If an undefined track is specified, all tracks should be "hidden".',
  done => {
    const firstUpdate = newState => {
      try {
        expect(m.textTracks[2].mode).toBe('hidden');
        expect(m.textTracks[3].mode).toBe('hidden');
        textTrackManager.handleSelectedTextTrackChange(newState.textTracks[1]);
      } catch (e) {
        done.fail(e);
      }
    };
    const secondUpdate = newState => {
      try {
        expect(newState.currentTextTrack).toBe(newState.textTracks[1]);
        expect(m.textTracks[2].mode).toBe('hidden');
        expect(m.textTracks[3].mode).toBe('showing');
        textTrackManager.handleSelectedTextTrackChange(null);
      } catch (e) {
        done.fail(e);
      }
    };
    const thirdUpdate = newState => {
      try {
        expect(newState.currentTextTrack).toBeUndefined();
        expect(m.textTracks[2].mode).toBe('hidden');
        expect(m.textTracks[3].mode).toBe('hidden');
        done();
      } catch (e) {
        done.fail(e);
      }
    };

    const updateFns = [thirdUpdate, secondUpdate, firstUpdate];
    const updateFn = newState => {
      updateFns.pop()(newState);
    };
    const m = getVideoElementMock();
    global.textTracks = m.textTracks;
    const textTrackManager = getTextTrackManager(m.videoElement, updateFn);
    textTrackManager.clear();
    textTrackManager.handleSourcePropChange({ source: { streamUrl: '', textTracks: exampleSourceTracks1 } });
  }
);

test('textTrackManager updates the currentTextTrack stream state property according to the initial setting, or when the visible track changes.', done => {
  const firstUpdate = () => {
    m.textTracks[2].mode = 'showing';
    m.notifyTrackEventListener();
  };
  const secondUpdate = newState => {
    try {
      expect(newState.currentTextTrack).toBe(newState.textTracks[0]);
      done();
    } catch (e) {
      done.fail(e);
    }
  };

  const updateFns = [secondUpdate, firstUpdate];
  const updateFn = newState => {
    updateFns.pop()(newState);
  };
  const m = getVideoElementMock();
  global.textTracks = m.textTracks;
  const textTrackManager = getTextTrackManager(m.videoElement, updateFn);
  textTrackManager.clear();
  textTrackManager.handleSourcePropChange({ source: { streamUrl: '', textTracks: exampleSourceTracks1 } });
});

test('textTrackManager adds and removes tracks based on events from the video element.', done => {
  const firstUpdate = () => {
    m.videoElement.textTracks.push({
      kind: 'captions',
      language: 'fr',
      label: 'G: French',
      mode: 'hidden'
    });
    m.notifyTrackEventListener();
  };
  const secondUpdate = newState => {
    try {
      expect(newState.textTracks).toHaveLength(3);
      expect(newState.textTracks[2]).toMatchObject({
        kind: 'captions',
        language: 'fr',
        label: 'G: French',
        origin: 'in-stream'
      });

      m.videoElement.textTracks.splice(2, 1);
      m.notifyTrackEventListener();
    } catch (e) {
      done.fail(e);
    }
  };
  const thirdUpdate = newState => {
    try {
      expect(newState.textTracks).toHaveLength(2);
      expect(newState.textTracks[0]).toMatchObject({
        language: 'sv',
        kind: 'captions',
        label: 'B: Swedish',
        origin: 'side-loaded'
      });
      expect(newState.textTracks[1]).toMatchObject({
        kind: 'captions',
        language: 'fr',
        label: 'G: French',
        origin: 'in-stream'
      });
      done();
    } catch (e) {
      done.fail(e);
    }
  };

  const updateFns = [thirdUpdate, secondUpdate, firstUpdate];
  const updateFn = newState => {
    updateFns.pop()(newState);
  };
  const m = getVideoElementMock();
  global.textTracks = m.textTracks;
  const textTrackManager = getTextTrackManager(m.videoElement, updateFn);
  textTrackManager.clear();
  textTrackManager.handleSourcePropChange({ source: { streamUrl: '', textTracks: exampleSourceTracks1 } });
});
