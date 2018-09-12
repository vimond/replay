// @flow
import type { AvailableTrack } from '../types';
import type { AudioTracksStateProps } from './streamStateUpdater';

// http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8

export type AudioTrackManager = {
  handleSelectedAudioTrackChange: (?AvailableTrack) => void,
  handleSourceChange: () => void,
  cleanup: () => void
};

type ManagedAudioTrack = {
  videoElementTrack: AudioTrack,
  selectableTrack: AvailableTrack
};

let id = 0;

const createManagedTrack = (videoElementTrack: AudioTrack): ManagedAudioTrack => {
  return {
    selectableTrack: {
      id: videoElementTrack.id == null ? `audio-${++id}` : videoElementTrack.id,
      language: videoElementTrack.language || '',
      kind: videoElementTrack.kind || '',
      label: videoElementTrack.label || '',
      origin: 'in-stream'
    },
    videoElementTrack
  };
};

const getAudioTrackManager = (
  videoElement: HTMLVideoElement,
  update: AudioTracksStateProps => void
): AudioTrackManager => {
  let managedTracks: Array<ManagedAudioTrack> = [];

  function mapAudioTracks() {
    // $FlowFixMe Array.from() doesn't seem to understand iterables from the DOM API.
    managedTracks = videoElement.audioTracks ? Array.from(videoElement.audioTracks).map(createManagedTrack) : [];
  }
  
  function updateStreamStateProps(selectedTrack?: ?AvailableTrack) {
    const currentAudioTrack = selectedTrack || managedTracks.filter(mt => mt.videoElementTrack.enabled).map(mt=> mt.selectableTrack)[0] || null;
    update({ audioTracks: managedTracks.map(mt => mt.selectableTrack), currentAudioTrack });
  }
  

  function handleTrackAddOrRemove() {
    mapAudioTracks();
    updateStreamStateProps();
  }
  
  function handleTrackChange() {
    updateStreamStateProps();
  }
  

  function setup() {
    if (videoElement.audioTracks) {
      videoElement.audioTracks.addEventListener('addtrack', handleTrackAddOrRemove);
      videoElement.audioTracks.addEventListener('change', handleTrackChange);
      videoElement.audioTracks.addEventListener('removetrack', handleTrackAddOrRemove);
    }
    handleSourceChange();
  }

  function handleSelectedAudioTrackChange(selectedAudioTrack: ?AvailableTrack) {
    const managedTrack = managedTracks.filter(mt => mt.selectableTrack === selectedAudioTrack)[0];
    if (managedTrack) {
      managedTrack.videoElementTrack.enabled = true;
    }
  }

  function cleanup() {
    if (videoElement.audioTracks) {
      videoElement.audioTracks.removeEventListener('addtrack', handleTrackAddOrRemove);
      videoElement.audioTracks.removeEventListener('change', handleTrackChange);
      videoElement.audioTracks.removeEventListener('removetrack', handleTrackAddOrRemove);
    }
    managedTracks = [];
  }

  function handleSourceChange() {
    handleTrackAddOrRemove();
  }

  setup();

  return {
    cleanup,
    handleSourceChange,
    handleSelectedAudioTrackChange
  };
};

export default getAudioTrackManager;
