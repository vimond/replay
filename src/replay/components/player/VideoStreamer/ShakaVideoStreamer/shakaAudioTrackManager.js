// @flow
import type { AvailableTrack, VideoStreamState } from '../types';
import type { ShakaLanguageRole, ShakaPlayer, ShakaTrack } from './types';
import type { AudioTrackManager } from '../common/types';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

type ManagedAudioTrack = {
  language: string,
  role: string,
  selectableTrack: AvailableTrack
};

const createManagedTrack = ({ language, role }: ShakaLanguageRole, index: number): ManagedAudioTrack => {
  return {
    selectableTrack: {
      id: language + role || index,
      kind: role,
      label: '',
      language: language,
      origin: 'in-stream'
    },
    language,
    role
  };
};

const isTrackMatchingLanguageAndRole = (shakaTrack: ShakaTrack, { language, role }: ShakaLanguageRole) => {
  return shakaTrack.language === language && (!role || (shakaTrack.roles && shakaTrack.roles.indexOf(role) >= 0));
};

const getShakaAudioTrackManager = (
  shakaPlayer: ShakaPlayer,
  updateStreamState: VideoStreamState => void
): AudioTrackManager => {
  let managedTracks: Array<ManagedAudioTrack> = [];

  function updateCurrentAudioTrack() {
    const activeShakaTrack = shakaPlayer.getVariantTracks().filter(track => track.active)[0];
    const currentAudioTrack =
      activeShakaTrack &&
      managedTracks.filter(mt => isTrackMatchingLanguageAndRole(activeShakaTrack, mt)).map(mt => mt.selectableTrack)[0];
    updateStreamState({ currentAudioTrack });
  }

  function updateAudioTracks() {
    managedTracks = shakaPlayer.getAudioLanguagesAndRoles().map(createManagedTrack);
    const audioTracks = managedTracks.map(mt => mt.selectableTrack);
    updateStreamState({
      audioTracks
    });
    updateCurrentAudioTrack();
  }

  const shakaEventHandlers = {
    loading: updateAudioTracks,
    trackschanged: updateAudioTracks,
    adaptation: updateCurrentAudioTrack
  };

  function handleSelectedAudioTrackChange(selectedAudioTrack: ?AvailableTrack) {
    const managedTrack = managedTracks.filter(mt => mt.selectableTrack === selectedAudioTrack)[0];
    if (managedTrack) {
      shakaPlayer.selectAudioLanguage(managedTrack.language, managedTrack.role);
      updateCurrentAudioTrack();
    }
  }

  function handleSourceChange() {}

  function cleanup() {
    Object.entries(shakaEventHandlers).forEach(([name, handler]) => {
      shakaPlayer.removeEventListener(name, handler);
    });
  }

  Object.entries(shakaEventHandlers).forEach(([name, handler]) => {
    shakaPlayer.addEventListener(name, handler);
  });

  return {
    cleanup,
    handleSourceChange,
    handleSelectedAudioTrackChange
  };
};

export default getShakaAudioTrackManager;
