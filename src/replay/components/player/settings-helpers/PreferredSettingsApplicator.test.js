import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { UnConnectedPreferredSettingsApplicator } from './PreferredSettingsApplicator';

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

const noPolicyConfig = {
  userSettings: {
    storageKey: 'replay-settings',
    settingsStoragePolicy: {
      textTrackLanguage: 'none'
    }
  }
};

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

const setup = (storageStr, props, isSession) => {
  setupStorageMocks();
  if (isSession) {
    window.localStorage.getItem.mockReturnValue(storageStr);
  } else {
    window.sessionStorage.getItem.mockReturnValue(storageStr);
  }
  const updateProperty = jest.fn();
  const settingsApplicator = mount(
    <UnConnectedPreferredSettingsApplicator
      {...props}
      configuration={isSession ? sessionConfig : localConfig}
      updateProperty={updateProperty}
    />
  );
  return {
    settingsApplicator,
    updateProperty
  };
};

test('When the playback is starting, apply settings for volume and mute.', () => {
  const { settingsApplicator, updateProperty } = setup('{"volume": 0.3, "textTrackLanguage": "en"}', {
    isMuted: true,
    playState: 'inactive'
  });
  settingsApplicator.setProps({ playState: 'starting' });
  settingsApplicator.update();
  expect(updateProperty).toHaveBeenCalledWith({ volume: 0.3, isMuted: true });
});

test(
  'When text tracks become available, select the best match ' +
    'according to stored or passed subtitles language or kind.',
  () => {
    {
      const { settingsApplicator, updateProperty } = setup('{"volume": 0.3, "textTrackLanguage": "en"}', {
        textTrackKind: 'captions'
      });
      settingsApplicator.setProps({ textTracks: [] });
      settingsApplicator.update();
      settingsApplicator.setProps({
        textTracks: [{ kind: 'captions', language: 'no' }, { kind: 'subtitles', language: 'en' }]
      });
      settingsApplicator.update();
      expect(updateProperty).toHaveBeenCalledWith({ selectedTextTrack: { kind: 'subtitles', language: 'en' } });
    }
    {
      const { settingsApplicator, updateProperty } = setup('{"textTrackKind": "captions"}', { textTracks: [] }, true);
      settingsApplicator.setProps({ textTracks: [{ kind: 'subtitles', language: 'no' }] });
      settingsApplicator.update();
      settingsApplicator.setProps({
        textTracks: [{ kind: 'captions', language: 'no' }]
      });
      settingsApplicator.update();
      expect(updateProperty).toHaveBeenCalledTimes(1);
      expect(updateProperty).toHaveBeenCalledWith({ selectedTextTrack: { kind: 'captions', language: 'no' } });
    }
  }
);

test(
  'When audio tracks become available, select the best match according to ' +
    'stored or passed audio language and kind, if there is more than one track.',
  () => {
    {
      const { settingsApplicator, updateProperty } = setup(
        '{"volume": 0.3, "audioTrackLanguage": "en"}',
        {
          audioTrackKind: 'main'
        },
        true
      );
      settingsApplicator.setProps({ audioTracks: [{ kind: 'commentary', language: 'en' }] });
      settingsApplicator.update();
      settingsApplicator.setProps({
        audioTracks: [{ kind: 'main', language: 'no' }, { kind: 'commentary', language: 'en' }]
      });
      settingsApplicator.update();
      expect(updateProperty).toHaveBeenCalledTimes(1);
      expect(updateProperty).toHaveBeenCalledWith({ selectedAudioTrack: { kind: 'commentary', language: 'en' } });
    }
    {
      const { settingsApplicator, updateProperty } = setup('{"audioTrackKind": "commentary"}', { audioTracks: [] });
      settingsApplicator.setProps({ audioTracks: [{ kind: 'main', language: 'no' }] });
      settingsApplicator.update();
      settingsApplicator.setProps({
        audioTracks: [{ kind: 'main', language: 'no' }, { kind: 'commentary', language: 'no' }]
      });
      settingsApplicator.update();
      expect(updateProperty).toHaveBeenCalledTimes(1);
      expect(updateProperty).toHaveBeenCalledWith({ selectedAudioTrack: { kind: 'commentary', language: 'no' } });
    }
  }
);

test(
  'If user settings are configured to take precedence, the passed ' +
    'settings props are ignored for values found in the storage.',
  () => {
    const { settingsApplicator, updateProperty } = setup('{"volume": 0.3, "textTrackLanguage": "en"}', {
      volume: 0.7,
      playState: 'inactive'
    });
    settingsApplicator.setProps({ playState: 'starting' });
    settingsApplicator.update();
    expect(updateProperty).toHaveBeenCalledWith({ volume: 0.3 });
  }
);

test('If user settings are configured to not take precedence, storage settings are ignored while props settings are applied.', () => {
  const { settingsApplicator, updateProperty } = setup(
    '{"volume": 0.3, "textTrackLanguage": "en"}',
    {
      volume: 0.7,
      playState: 'inactive'
    },
    true
  );
  settingsApplicator.setProps({ playState: 'starting' });
  settingsApplicator.update();
  expect(updateProperty).toHaveBeenCalledWith({ volume: 0.7 });
});

test('If no settings are saved, nothing is applied.', () => {
  const { settingsApplicator, updateProperty } = setup(undefined, {
    playState: 'inactive'
  });
  settingsApplicator.setProps({ playState: 'starting' });
  settingsApplicator.update();
  settingsApplicator.setProps({ textTracks: [{ kind: 'subtitles', language: 'no' }] });
  settingsApplicator.update();
  settingsApplicator.setProps({ audioTracks: [{ kind: 'main', language: 'no' }] });
  settingsApplicator.update();
  expect(updateProperty).not.toHaveBeenCalled();
});
