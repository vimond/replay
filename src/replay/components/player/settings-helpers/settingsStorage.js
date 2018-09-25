// @flow
import * as React from 'react';
import type { PlaybackProps } from '../VideoStreamer/types';
import type { StreamStateKeysForObservation, SetPropertyMethod } from '../PlayerController/ControllerContext';
import type { UserSettingsConfiguration } from './PreferredSettingsApplicator';
import type { PreferredSettings } from '../../../default-player/types';

type SettingsStorageProps = {
  configuration?: ?UserSettingsConfiguration,
  setProperty?: SetPropertyMethod
};

type TargetProps = {
  setProperty?: SetPropertyMethod
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

const withSettingsStorage = (Component: React.ComponentType<TargetProps>) => {
  class SettingsStorage extends React.Component<SettingsStorageProps> {
    // $FlowFixMe What's the best practices for extending component types with static properties?
    static streamStateKeysForObservation: StreamStateKeysForObservation = Component.streamStateKeysForObservation;

    setProperty = (userSetProps: PlaybackProps) => {
      if (this.props.setProperty) {
        this.props.setProperty(userSetProps);
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
            localStorage.setItem(storageKey, JSON.stringify(localSettings));
          }
          if (Object.keys(sessionSettings).length > 0) {
            sessionStorage.setItem(storageKey, JSON.stringify(sessionSettings));
          }
        }
      }
    };

    render() {
      if (isEnabled(this.props.configuration)) {
        return <Component {...this.props} setProperty={this.setProperty} />;
      } else {
        return <Component {...this.props} />;
      }
    }
  }
  SettingsStorage.displayName = 'SettingsStorage' + (Component.displayName || Component.name);
  return SettingsStorage;
};

export default withSettingsStorage;
