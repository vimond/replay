import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { getPreferredSettingsApplicator } from './PreferredSettingsApplicator';

Enzyme.configure({ adapter: new Adapter() });

const localConfig = {
  userSettings: {
    storageKey: 'replay-settings',
    hasPrecedence: true,
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

/*const noPolicyConfig = {
  userSettings: {
    storageKey: 'replay-settings',
    settingsStoragePolicy: {
      textTrackLanguage: 'none'
    }
  }
};*/

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

const setup = (storageStr, props, isSession) => {
  const { localStorage, sessionStorage } = getStorageMocks();
  if (isSession) {
    localStorage.getItem.mockReturnValue(storageStr);
  } else {
    sessionStorage.getItem.mockReturnValue(storageStr);
  }
  const setProperties = jest.fn();
  const PreferredSettingsApplicator = getPreferredSettingsApplicator(localStorage, sessionStorage);
  const settingsApplicator = mount(
    <PreferredSettingsApplicator
      {...props}
      configuration={isSession ? sessionConfig : localConfig}
      setProperties={setProperties}
    />
  );
  return {
    settingsApplicator,
    setProperties
  };
};

test('When the playback is starting, apply settings for volume and mute.', () => {
  const { settingsApplicator, setProperties } = setup('{"volume": 0.3, "textTrackLanguage": "en"}', {
    isMuted: true,
    playState: 'inactive'
  });
  settingsApplicator.setProps({ playState: 'starting' });
  settingsApplicator.update();
  expect(setProperties).toHaveBeenCalledWith({ volume: 0.3, isMuted: true });
});

test(
  'When text tracks become available, select the best match ' +
    'according to stored or passed subtitles language or kind.',
  () => {
    {
      const { settingsApplicator, setProperties } = setup('{"volume": 0.3, "textTrackLanguage": "en"}', {
        textTrackKind: 'captions'
      });
      settingsApplicator.setProps({ textTracks: [] });
      settingsApplicator.update();
      settingsApplicator.setProps({
        textTracks: [
          { kind: 'captions', language: 'no' },
          { kind: 'subtitles', language: 'en' }
        ]
      });
      settingsApplicator.update();
      expect(setProperties).toHaveBeenCalledWith({ selectedTextTrack: { kind: 'subtitles', language: 'en' } });
    }
    {
      const { settingsApplicator, setProperties } = setup('{"textTrackKind": "captions"}', { textTracks: [] }, true);
      settingsApplicator.setProps({ textTracks: [{ kind: 'subtitles', language: 'no' }] });
      settingsApplicator.update();
      settingsApplicator.setProps({
        textTracks: [{ kind: 'captions', language: 'no' }]
      });
      settingsApplicator.update();
      expect(setProperties).toHaveBeenCalledTimes(1);
      expect(setProperties).toHaveBeenCalledWith({ selectedTextTrack: { kind: 'captions', language: 'no' } });
    }
  }
);

test(
  'When audio tracks become available, select the best match according to ' +
    'stored or passed audio language and kind, if there is more than one track.',
  () => {
    {
      const { settingsApplicator, setProperties } = setup(
        '{"volume": 0.3, "audioTrackLanguage": "en"}',
        {
          audioTrackKind: 'main'
        },
        true
      );
      settingsApplicator.setProps({ audioTracks: [{ kind: 'commentary', language: 'en' }] });
      settingsApplicator.update();
      settingsApplicator.setProps({
        audioTracks: [
          { kind: 'main', language: 'no' },
          { kind: 'commentary', language: 'en' }
        ]
      });
      settingsApplicator.update();
      expect(setProperties).toHaveBeenCalledTimes(1);
      expect(setProperties).toHaveBeenCalledWith({ selectedAudioTrack: { kind: 'commentary', language: 'en' } });
    }
    {
      const { settingsApplicator, setProperties } = setup('{"audioTrackKind": "commentary"}', { audioTracks: [] });
      settingsApplicator.setProps({ audioTracks: [{ kind: 'main', language: 'no' }] });
      settingsApplicator.update();
      settingsApplicator.setProps({
        audioTracks: [
          { kind: 'main', language: 'no' },
          { kind: 'commentary', language: 'no' }
        ]
      });
      settingsApplicator.update();
      expect(setProperties).toHaveBeenCalledTimes(1);
      expect(setProperties).toHaveBeenCalledWith({ selectedAudioTrack: { kind: 'commentary', language: 'no' } });
    }
  }
);

test(
  'If user settings are configured to take precedence, the passed ' +
    'settings props are ignored for values found in the storage.',
  () => {
    const { settingsApplicator, setProperties } = setup('{"volume": 0.3, "textTrackLanguage": "en"}', {
      volume: 0.7,
      playState: 'inactive'
    });
    settingsApplicator.setProps({ playState: 'starting' });
    settingsApplicator.update();
    expect(setProperties).toHaveBeenCalledWith({ volume: 0.3 });
  }
);

test('If user settings are configured to not take precedence, storage settings are ignored while props settings are applied.', () => {
  const { settingsApplicator, setProperties } = setup(
    '{"volume": 0.3, "textTrackLanguage": "en"}',
    {
      volume: 0.7,
      playState: 'inactive'
    },
    true
  );
  settingsApplicator.setProps({ playState: 'starting' });
  settingsApplicator.update();
  expect(setProperties).toHaveBeenCalledWith({ volume: 0.7 });
});

test('If no settings are saved, nothing is applied.', () => {
  const { settingsApplicator, setProperties } = setup(undefined, {
    playState: 'inactive'
  });
  settingsApplicator.setProps({ playState: 'starting' });
  settingsApplicator.update();
  settingsApplicator.setProps({ textTracks: [{ kind: 'subtitles', language: 'no' }] });
  settingsApplicator.update();
  settingsApplicator.setProps({ audioTracks: [{ kind: 'main', language: 'no' }] });
  settingsApplicator.update();
  expect(setProperties).not.toHaveBeenCalled();
});
