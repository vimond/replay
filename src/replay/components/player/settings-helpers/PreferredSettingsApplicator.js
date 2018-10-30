// @flow
import * as React from 'react';
import connectControl from '../PlayerController/connectControl';

import type { AvailableTrack, PlayState } from '../VideoStreamer/types';
import type { StreamStateKeysForObservation, SetPropertiesMethod } from '../PlayerController/ControllerContext';
import type { PreferredSettings } from '../../../default-player/types';

type SettingsStorageKind = 'none' | 'local' | 'session';

export type UserSettingsConfiguration = {
  userSettings?: {
    hasPrecedence?: ?boolean,
    storageKey?: string,
    settingsStoragePolicy: {
      volume?: ?SettingsStorageKind,
      isMuted?: ?SettingsStorageKind,
      textTrackLanguage?: ?SettingsStorageKind,
      textTrackKind?: ?SettingsStorageKind,
      audioTrackLanguage?: ?SettingsStorageKind,
      audioTrackKind?: ?SettingsStorageKind
    }
  }
};

type Props = PreferredSettings & {
  textTracks?: Array<AvailableTrack>,
  audioTracks?: Array<AvailableTrack>,
  playState?: PlayState,
  setProperties: SetPropertiesMethod,
  configuration?: ?UserSettingsConfiguration
};

const noop = () => {};

const getTrackFromLanguageAndKind = (
  language: ?string,
  kind: ?string,
  tracks: ?Array<AvailableTrack>,
  ignorableLength: number
): ?AvailableTrack => {
  if (Array.isArray(tracks) && tracks.length > ignorableLength) {
    return (
      tracks.filter(track => track.language === language && track.kind === kind)[0] ||
      tracks.filter(track => track.language === language)[0] ||
      tracks.filter(track => track.kind === kind)[0]
    );
  }
};

const getTrackToSelect = (
  preferredLanguage: ?string,
  preferredKind: ?string,
  prevTracks: ?Array<AvailableTrack>,
  nextTracks: ?Array<AvailableTrack>,
  ignorableTrackListLength: number
) => {
  if (prevTracks !== nextTracks && Array.isArray(nextTracks) && nextTracks.length > 0) {
    return getTrackFromLanguageAndKind(preferredLanguage, preferredKind, nextTracks, ignorableTrackListLength);
  }
};

const mergePreferredSettings = (
  configuration: ?UserSettingsConfiguration,
  programmaticSettings: PreferredSettings
): PreferredSettings => {
  const userSettingsConfig = configuration && configuration.userSettings;
  const storageKey = userSettingsConfig && userSettingsConfig.storageKey;
  if (userSettingsConfig && storageKey) {
    let localSettings = {};
    let sessionSettings = {};
    try {
      sessionSettings = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
    } catch (e) {}
    try {
      localSettings = JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch (e) {}
    if (userSettingsConfig.hasPrecedence) {
      return {
        ...programmaticSettings,
        ...localSettings,
        ...sessionSettings
      };
    } else {
      return {
        ...localSettings,
        ...sessionSettings,
        ...programmaticSettings
      };
    }
  } else {
    return programmaticSettings;
  }
};

const getPropsToBeUpdated = (
  prevPlayState: ?PlayState,
  nextPlayState: ?PlayState,
  prevAudioTracks: ?Array<AvailableTrack>,
  prevTextTracks: ?Array<AvailableTrack>,
  nextAudioTracks: ?Array<AvailableTrack>,
  nextTextTracks: ?Array<AvailableTrack>,
  preferredSettings: PreferredSettings
) => {
  const updates = {};

  if (nextPlayState !== prevPlayState && nextPlayState === 'starting') {
    if (preferredSettings.volume != null) {
      updates.volume = preferredSettings.volume;
    }
    if (preferredSettings.isMuted != null) {
      updates.isMuted = preferredSettings.isMuted;
    }
  }

  const audioTrackToSelect = getTrackToSelect(
    preferredSettings.audioTrackLanguage,
    preferredSettings.audioTrackKind,
    prevAudioTracks,
    nextAudioTracks,
    1
  );
  if (audioTrackToSelect) {
    updates.selectedAudioTrack = audioTrackToSelect;
  }

  const textTrackToSelect = getTrackToSelect(
    preferredSettings.textTrackLanguage,
    preferredSettings.textTrackKind,
    prevTextTracks,
    nextTextTracks,
    0
  );
  if (textTrackToSelect) {
    updates.selectedTextTrack = textTrackToSelect;
  }

  return updates;
};

const onPropsChanged = (prevProps: Props, nextProps: Props) => {
  const {
    configuration,
    playState,
    audioTracks,
    textTracks,
    volume,
    isMuted,
    textTrackLanguage,
    textTrackKind,
    audioTrackLanguage,
    audioTrackKind,
    setProperties
  } = nextProps;

  const programmaticSettings = {};
  if (volume != null) {
    programmaticSettings.volume = volume;
  }
  if (isMuted != null) {
    programmaticSettings.isMuted = isMuted;
  }
  if (textTrackLanguage != null) {
    programmaticSettings.textTrackLanguage = textTrackLanguage;
  }
  if (textTrackKind != null) {
    programmaticSettings.textTrackKind = textTrackKind;
  }
  if (audioTrackLanguage != null) {
    programmaticSettings.audioTrackLanguage = audioTrackLanguage;
  }
  if (audioTrackKind != null) {
    programmaticSettings.audioTrackKind = audioTrackKind;
  }

  const mergedSettings = mergePreferredSettings(configuration, programmaticSettings);
  const propsToBeUpdated = getPropsToBeUpdated(
    prevProps.playState,
    playState,
    prevProps.audioTracks,
    prevProps.textTracks,
    audioTracks,
    textTracks,
    mergedSettings
  );

  if (Object.keys(propsToBeUpdated).length > 0) {
    setProperties(propsToBeUpdated);
  }
};

// https://twitter.com/t045tbr0t/status/972275166611898368
export const UnConnectedPreferredSettingsApplicator = class PreferredSettingsApplicator extends React.Component<Props> {
  static streamStateKeysForObservation: StreamStateKeysForObservation = ['playState', 'textTracks', 'audioTracks'];
  componentDidMount() {
    onPropsChanged({ setProperties: noop }, this.props);
  }
  componentDidUpdate(prevProps: Props) {
    onPropsChanged(prevProps, this.props);
  }
  render() {
    return null;
  }
};

const PreferredSettingsApplicator = connectControl(UnConnectedPreferredSettingsApplicator);

export default PreferredSettingsApplicator;
