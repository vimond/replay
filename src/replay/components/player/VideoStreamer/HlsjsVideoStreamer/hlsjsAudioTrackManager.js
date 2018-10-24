// @flow
import type { AvailableTrack, VideoStreamState } from '../types';
import type { AudioTrackManager } from '../common/types';
import type { HlsjsAudioTrack } from 'hls.js';
import Hls from 'hls.js';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

// http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8

type ManagedAudioTrack = {
  hlsjsAudioTrack: HlsjsAudioTrack,
  selectableTrack: AvailableTrack
};

const createManagedTrack = (hlsjsAudioTrack: HlsjsAudioTrack): ManagedAudioTrack => {
  return {
    selectableTrack: {
      id: hlsjsAudioTrack.id,
      language: hlsjsAudioTrack.lang || '',
      kind: '',
      label: hlsjsAudioTrack.name || '',
      origin: 'in-stream'
    },
    hlsjsAudioTrack
  };
};

const getAudioTrackManager = (hls: Hls, update: VideoStreamState => void): AudioTrackManager => {
  let managedTracks: Array<ManagedAudioTrack> = [];

  function mapAudioTracks() {
    // $FlowFixMe Array.from() doesn't seem to understand iterables from the DOM API.
    managedTracks = hls.audioTracks ? hls.audioTracks.map(createManagedTrack) : [];
  }

  function updateStreamStateProps(selectedTrack?: ?AvailableTrack) {
    const currentAudioTrack =
      selectedTrack ||
      managedTracks.filter(mt => mt.hlsjsAudioTrack.id === hls.audioTrack).map(mt => mt.selectableTrack)[0] ||
      null;
    // TODO: Don't create a new array object every time.
    update({ audioTracks: managedTracks.map(mt => mt.selectableTrack), currentAudioTrack });
  }

  function refresh() {
    mapAudioTracks();
    updateStreamStateProps();
  }

  function handleTrackChange() {
    updateStreamStateProps();
  }

  function handleSelectedAudioTrackChange(selectedAudioTrack: ?AvailableTrack) {
    const managedTrack = managedTracks.filter(mt => mt.selectableTrack === selectedAudioTrack)[0];
    if (managedTrack) {
      hls.audioTrack = managedTrack.hlsjsAudioTrack.id;
    }
  }

  function reset() {
    managedTracks = [];
  }

  function handleSourceChange() {
    refresh();
  }

  const hlsjsEventHandlers = {
    [Hls.Events.MANIFEST_LOADING]: () => reset,
    [Hls.Events.MANIFEST_PARSED]: refresh,
    [Hls.Events.AUDIO_TRACK_SWITCHED]: handleTrackChange,
    [Hls.Events.DESTROYING]: cleanup
  };

  function cleanup() {
    Object.entries(hlsjsEventHandlers).forEach(([name, handler]) => {
      hls.off(name, handler);
    });
  }

  Object.entries(hlsjsEventHandlers).forEach(([name, handler]) => {
    hls.on(name, handler);
  });

  return {
    cleanup,
    handleSourceChange,
    handleSelectedAudioTrackChange
  };
};

export default getAudioTrackManager;
