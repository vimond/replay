import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import withSettingsStorage from './settingsStorage';

Enzyme.configure({ adapter: new Adapter() });

const setupStorageMocks = () => {
  window.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn()
  };

  window.sessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn()
  };
};

const localConfig = {
  userSettings: {
    storageKey: 'replay-settings',
    settingsStoragePolicy: {
      volume: 'local',
      isMuted: 'local',
      audioTrackKind: 'local',
      audioTrackLanguage: 'local',
      textTrackKind: 'local',
      textTrackLanguage: 'local'
    }
  }
};

const sessionConfig = {
  userSettings: {
    storageKey: 'replay-settings',
    settingsStoragePolicy: {
      volume: 'session',
      isMuted: 'session',
      audioTrackKind: 'session',
      audioTrackLanguage: 'session',
      textTrackKind: 'session',
      textTrackLanguage: 'session'
    }
  }
};

const noPolicyConfig = {
  userSettings: {
    storageKey: 'replay-settings',
    settingsStoragePolicy: {
      textTrackLanguage: 'none'
    }
  }
};

const noStorageKeyConfig = {
  userSettings: {
    settingsStoragePolicy: {
      volume: 'local',
      isMuted: 'local',
      audioTrackKind: 'local',
      audioTrackLanguage: 'local',
      textTrackKind: 'local',
      textTrackLanguage: 'local'
    }
  }
};

const setup = configuration => {
  setupStorageMocks();
  const setProperty = jest.fn();

  const returnValue = {
    setProperty
  };

  const Component = ({ setProperty }) => {
    returnValue.updater = setProperty;
    return null;
  };
  const Hoc = withSettingsStorage(Component);

  returnValue.rendered = mount(<Hoc configuration={configuration} setProperty={setProperty} />);
  return returnValue;
};

const expectStorageContentToEqual = (storage, settingsObj, callIndex = 0) => {
  if (settingsObj) {
    const storageKey = storage.setItem.mock.calls[callIndex][0];
    expect(storageKey).toBe('replay-settings');
    const data = JSON.parse(storage.setItem.mock.calls[callIndex][1]);
    expect(data).toEqual(settingsObj);
  } else {
    expect(storage.setItem).not.toHaveBeenCalled();
  }
};

test('withSettingsStorage() stores a valid updated volume prop to the configured storage.', () => {
  setup(localConfig).updater({ volume: 0.5 });
  expectStorageContentToEqual(window.localStorage, { volume: 0.5 });
  setup(sessionConfig).updater({ volume: 0.3 });
  expectStorageContentToEqual(window.sessionStorage, { volume: 0.3 });
});

test('withSettingsStorage() does not store an invalid volume prop to storage.', () => {
  const { updater } = setup(localConfig);
  updater({ volume: null });
  expectStorageContentToEqual(window.localStorage, null);
});

test('withSettingsStorage() stores an updated isMuted prop to the configured storage.', () => {
  setup(localConfig).updater({ isMuted: true });
  expectStorageContentToEqual(window.localStorage, { isMuted: true });
  setup(sessionConfig).updater({ isMuted: false });
  expectStorageContentToEqual(window.sessionStorage, { isMuted: false });
});

test('withSettingsStorage() stores the language and kind from the updated selectedTectTrack prop to the configured storage.', () => {
  setup(localConfig).updater({ selectedTextTrack: { kind: 'captions', language: 'en', label: 'English' } });
  expectStorageContentToEqual(window.localStorage, { textTrackLanguage: 'en', textTrackKind: 'captions' });
  setup(sessionConfig).updater({ selectedTextTrack: { kind: 'subtitles', language: 'fi', label: 'Finnish' } });
  expectStorageContentToEqual(window.sessionStorage, { textTrackLanguage: 'fi', textTrackKind: 'subtitles' });
});

test('withSettingsStorage() still stores the language from the updated selectedTextTrack prop, even if kind is unspecified. And opposite.', () => {
  setup(localConfig).updater({ selectedTextTrack: { kind: undefined, language: 'en', label: 'English' } });
  expectStorageContentToEqual(window.localStorage, { textTrackLanguage: 'en' });
  setup(sessionConfig).updater({ selectedTextTrack: { kind: 'subtitles', label: 'Finnish' } });
  expectStorageContentToEqual(window.sessionStorage, { textTrackKind: 'subtitles' });
});

test('withSettingsStorage() stores the language and kind from the updated selectedAudioTrack prop to the configured storage.', () => {
  setup(localConfig).updater({ selectedAudioTrack: { kind: 'commentary', language: 'en', label: 'English' } });
  expectStorageContentToEqual(window.localStorage, { audioTrackLanguage: 'en', audioTrackKind: 'commentary' });
  setup(sessionConfig).updater({ selectedAudioTrack: { kind: 'main', language: 'fi', label: 'Finnish' } });
  expectStorageContentToEqual(window.sessionStorage, { audioTrackLanguage: 'fi', audioTrackKind: 'main' });
});

test('withSettingsStorage() retains other settings in the storage when updating one.', () => {
  {
    const { updater } = setup(localConfig);
    window.localStorage.getItem.mockReturnValue('{"volume":0.5,"isMuted":true}');
    updater({ selectedTextTrack: { kind: 'captions', language: 'en', label: 'English' } });
    expectStorageContentToEqual(window.localStorage, {
      isMuted: true,
      volume: 0.5,
      textTrackLanguage: 'en',
      textTrackKind: 'captions'
    });
  }
  {
    const { updater } = setup(sessionConfig);
    window.sessionStorage.getItem.mockReturnValue('{"audioTrackKind":"main","isMuted":true}');
    updater({ selectedAudioTrack: { kind: null, language: 'no' } });
    expectStorageContentToEqual(window.sessionStorage, {
      isMuted: true,
      audioTrackLanguage: 'no',
      audioTrackKind: 'main'
    });
  }
});

test('withSettingsStorage() does not store a setting if storagePolicy is unspecified, or set to "none".', () => {
  setup(noStorageKeyConfig).updater({ isMuted: true });
  expectStorageContentToEqual(window.localStorage, null);
  expectStorageContentToEqual(window.sessionStorage, null);
  setup(noPolicyConfig).updater({ isMuted: false });
  expectStorageContentToEqual(window.localStorage, null);
  expectStorageContentToEqual(window.sessionStorage, null);
});

test("withSettingsStorage() doesn't store anything from unrecognized props.", () => {
  const { updater } = setup(localConfig);
  window.localStorage.getItem.mockReturnValue('{"volume":0.5,"isMuted":true}');
  updater({ isPaused: true, playState: 'buffering' });
  expectStorageContentToEqual(window.localStorage, {
    isMuted: true,
    volume: 0.5
  });
});

test('withSettingsStorage() calls the original setProperty prop when wrapped component does it', () => {
  const { updater, setProperty } = setup(localConfig);
  updater({ isPaused: true });
  expect(setProperty).toHaveBeenCalledWith({ isPaused: true });
});
