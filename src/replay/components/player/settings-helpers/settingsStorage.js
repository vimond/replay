// @flow
import * as React from 'react';
import type { PlaybackProps } from '../VideoStreamer/types';
import type { StreamStateKeysForObservation, SetPropertiesMethod } from '../PlayerController/ControllerContext';
import type { UserSettingsConfiguration } from './PreferredSettingsApplicator';
import type { PreferredSettings } from '../../../default-player/types';

type SettingsStorageProps<T: { setProperties?: any => void }> = T & {
  configuration?: ?UserSettingsConfiguration
};

const isEnabled = (configuration: ?UserSettingsConfiguration) => {
  return (
    configuration &&
    configuration.userSettings &&
    configuration.userSettings.storageKey &&
    configuration.userSettings.settingsStoragePolicy
  );
};

const getStoredSettings = (storage: Storage, key: string): PreferredSettings => {
  try {
    const storedStr = storage.getItem(key);
    if (storedStr) {
      return JSON.parse(storedStr);
    } else {
      return {};
    }
  } catch (e) {
    return {};
  }
};

const withStorage = (
  storagePolicy,
  key: string,
  sessionSettings: PreferredSettings,
  localSettings: PreferredSettings,
  callback: PreferredSettings => any
) => {
  switch (storagePolicy[key]) {
    case 'local':
      callback(localSettings);
      return;
    case 'session':
      callback(sessionSettings);
      return;
    default:
      return;
  }
};

const withSettingsStorage = <P: { setProperties?: any => void }>(
  Component: React.ComponentType<P>,
  localStorage: Storage = window.localStorage,
  sessionStorage: Storage = window.sessionStorage
) => {
  class SettingsStorage extends React.Component<SettingsStorageProps<P>> {
    // $FlowFixMe What's the best practices for extending component types with static properties?
    static streamStateKeysForObservation: StreamStateKeysForObservation = Component.streamStateKeysForObservation;

    setProperties = (userSetProps: PlaybackProps) => {
      if (this.props.setProperties) {
        this.props.setProperties(userSetProps);
      }
      const userSettingsConfig = this.props.configuration && this.props.configuration.userSettings;
      if (userSettingsConfig) {
        const storageKey = userSettingsConfig.storageKey;
        const storagePolicy = userSettingsConfig.settingsStoragePolicy;
        if (storageKey && storagePolicy) {
          const localSettings = getStoredSettings(localStorage, storageKey);
          const sessionSettings = getStoredSettings(sessionStorage, storageKey);
          if ('isMuted' in userSetProps) {
            withStorage(
              storagePolicy,
              'isMuted',
              sessionSettings,
              localSettings,
              settings => (settings.isMuted = !!userSetProps.isMuted)
            );
          }
          if (typeof userSetProps.volume === 'number') {
            withStorage(
              storagePolicy,
              'volume',
              sessionSettings,
              localSettings,
              settings => (settings.volume = userSetProps.volume)
            );
          }
          if ('selectedTextTrack' in userSetProps) {
            withStorage(storagePolicy, 'textTrackLanguage', sessionSettings, localSettings, settings => {
              if (userSetProps.selectedTextTrack) {
                if (userSetProps.selectedTextTrack.language) {
                  settings.textTrackLanguage = userSetProps.selectedTextTrack.language;
                }
              } else {
                // Subtitles were turned off.
                delete settings.textTrackLanguage;
              }
            });
            withStorage(storagePolicy, 'textTrackKind', sessionSettings, localSettings, settings => {
              if (userSetProps.selectedTextTrack) {
                if (userSetProps.selectedTextTrack.kind) {
                  settings.textTrackKind = userSetProps.selectedTextTrack.kind;
                }
              } else {
                // Subtitles were turned off.
                delete settings.textTrackKind;
              }
            });
          }
          if ('selectedAudioTrack' in userSetProps) {
            withStorage(storagePolicy, 'audioTrackLanguage', sessionSettings, localSettings, settings => {
              if (userSetProps.selectedAudioTrack && userSetProps.selectedAudioTrack.language) {
                settings.audioTrackLanguage = userSetProps.selectedAudioTrack.language;
              }
            });
            withStorage(storagePolicy, 'audioTrackKind', sessionSettings, localSettings, settings => {
              if (userSetProps.selectedAudioTrack && userSetProps.selectedAudioTrack.kind) {
                settings.audioTrackKind = userSetProps.selectedAudioTrack.kind;
              }
            });
          }
          if (Object.keys(localSettings).length > 0) {
            try {
              localStorage.setItem(storageKey, JSON.stringify(localSettings));
            } catch (e) {}
          }
          if (Object.keys(sessionSettings).length > 0) {
            try {
              sessionStorage.setItem(storageKey, JSON.stringify(sessionSettings));
            } catch (e) {}
          }
        }
      }
    };

    render() {
      const { configuration, ...remainder } = this.props;
      if (isEnabled(this.props.configuration)) {
        return <Component {...remainder} setProperties={this.setProperties} />;
      } else {
        return <Component {...remainder} />;
      }
    }
  }
  SettingsStorage.displayName = 'SettingsStorage' + (Component.displayName || Component.name);
  return SettingsStorage;
};

export default withSettingsStorage;
