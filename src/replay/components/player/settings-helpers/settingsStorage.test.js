import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import withSettingsStorage from './settingsStorage';

Enzyme.configure({ adapter: new Adapter() });

const getStorageMocks = () => ({
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn()
  },
  sessionStorage: {
    getItem: jest.fn(),
    setItem: jest.fn()
  }
});

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
  const { localStorage, sessionStorage } = getStorageMocks();
  const setProperties = jest.fn();

  const returnValue = {
    setProperties,
    localStorage,
    sessionStorage
  };

  const Component = ({ setProperties }) => {
    returnValue.updater = setProperties;
    return null;
  };
  const Hoc = withSettingsStorage(Component, localStorage, sessionStorage);

  returnValue.rendered = mount(<Hoc configuration={configuration} setProperties={setProperties} />);
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
  {
    const { localStorage, updater } = setup(localConfig);
    updater({ volume: 0.5 });
    expectStorageContentToEqual(localStorage, { volume: 0.5 });
  }
  {
    const { sessionStorage, updater } = setup(sessionConfig);
    updater({ volume: 0.3 });
    expectStorageContentToEqual(sessionStorage, { volume: 0.3 });
  }
});

test('withSettingsStorage() does not store an invalid volume prop to storage.', () => {
  const { localStorage, updater } = setup(localConfig);
  updater({ volume: null });
  expectStorageContentToEqual(localStorage, null);
});

test('withSettingsStorage() stores an updated isMuted prop to the configured storage.', () => {
  {
    const { localStorage, updater } = setup(localConfig);
    updater({ isMuted: true });
    expectStorageContentToEqual(localStorage, { isMuted: true });
  }
  {
    const { sessionStorage, updater } = setup(sessionConfig);
    updater({ isMuted: false });
    expectStorageContentToEqual(sessionStorage, { isMuted: false });
  }
});

test('withSettingsStorage() stores the language and kind from the updated selectedTectTrack prop to the configured storage.', () => {
  {
    const { localStorage, updater } = setup(localConfig);
    updater({ selectedTextTrack: { kind: 'captions', language: 'en', label: 'English' } });
    expectStorageContentToEqual(localStorage, { textTrackLanguage: 'en', textTrackKind: 'captions' });
  }
  {
    const { sessionStorage, updater } = setup(sessionConfig);
    updater({ selectedTextTrack: { kind: 'subtitles', language: 'fi', label: 'Finnish' } });
    expectStorageContentToEqual(sessionStorage, { textTrackLanguage: 'fi', textTrackKind: 'subtitles' });
  }
});

test('withSettingsStorage() still stores the language from the updated selectedTextTrack prop, even if kind is unspecified. And opposite.', () => {
  {
    const { localStorage, updater } = setup(localConfig);
    updater({ selectedTextTrack: { kind: undefined, language: 'en', label: 'English' } });
    expectStorageContentToEqual(localStorage, { textTrackLanguage: 'en' });
  }
  {
    const { sessionStorage, updater } = setup(sessionConfig);
    updater({ selectedTextTrack: { kind: 'subtitles', label: 'Finnish' } });
    expectStorageContentToEqual(sessionStorage, { textTrackKind: 'subtitles' });
  }
});

test('withSettingsStorage() stores the language and kind from the updated selectedAudioTrack prop to the configured storage.', () => {
  {
    const { localStorage, updater } = setup(localConfig);
    updater({ selectedAudioTrack: { kind: 'commentary', language: 'en', label: 'English' } });
    expectStorageContentToEqual(localStorage, { audioTrackLanguage: 'en', audioTrackKind: 'commentary' });
  }
  {
    const { sessionStorage, updater } = setup(sessionConfig);
    updater({ selectedAudioTrack: { kind: 'main', language: 'fi', label: 'Finnish' } });
    expectStorageContentToEqual(sessionStorage, { audioTrackLanguage: 'fi', audioTrackKind: 'main' });
  }
});

test('withSettingsStorage() retains other settings in the storage when updating one.', () => {
  {
    const { updater, localStorage } = setup(localConfig);
    localStorage.getItem.mockReturnValue('{"volume":0.5,"isMuted":true}');
    updater({ selectedTextTrack: { kind: 'captions', language: 'en', label: 'English' } });
    expectStorageContentToEqual(localStorage, {
      isMuted: true,
      volume: 0.5,
      textTrackLanguage: 'en',
      textTrackKind: 'captions'
    });
  }
  {
    const { updater, sessionStorage } = setup(sessionConfig);
    sessionStorage.getItem.mockReturnValue('{"audioTrackKind":"main","isMuted":true}');
    updater({ selectedAudioTrack: { kind: null, language: 'no' } });
    expectStorageContentToEqual(sessionStorage, {
      isMuted: true,
      audioTrackLanguage: 'no',
      audioTrackKind: 'main'
    });
  }
});

test('withSettingsStorage() does not store a setting if storagePolicy is unspecified, or set to "none".', () => {
  {
    const { updater, localStorage, sessionStorage } = setup(noStorageKeyConfig);
    updater({ isMuted: true });
    expectStorageContentToEqual(localStorage, null);
    expectStorageContentToEqual(sessionStorage, null);
  }
  {
    const { updater, localStorage, sessionStorage } = setup(noPolicyConfig);
    updater({ isMuted: false });
    expectStorageContentToEqual(localStorage, null);
    expectStorageContentToEqual(sessionStorage, null);
  }
});

test("withSettingsStorage() doesn't store anything from unrecognized props.", () => {
  const { updater, localStorage } = setup(localConfig);
  localStorage.getItem.mockReturnValue('{"volume":0.5,"isMuted":true}');
  updater({ isPaused: true, playState: 'buffering' });
  expectStorageContentToEqual(localStorage, {
    isMuted: true,
    volume: 0.5
  });
});

test('withSettingsStorage() calls the original setProperties prop when wrapped component does it', () => {
  const { updater, setProperties } = setup(localConfig);
  updater({ isPaused: true });
  expect(setProperties).toHaveBeenCalledWith({ isPaused: true });
});
