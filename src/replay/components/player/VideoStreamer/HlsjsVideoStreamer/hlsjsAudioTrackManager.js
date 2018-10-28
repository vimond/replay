// @flow
import type { AvailableTrack, VideoStreamState } from '../types';
import type { AudioTrackManager } from '../common/types';
import type { HlsjsAudioTrack } from 'hls.js';
import Hls from 'hls.js';
import type { HlsjsInstanceKeeper } from './HlsjsVideoStreamer';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

// http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8

const getDistinctPseudoTracks = (audioTracks: ?Array<HlsjsAudioTrack>): Array<AvailableTrack> => {
  const foundKeys = [];
  return audioTracks ? audioTracks.filter(track => {
    const key = `${track.lang || ''}!${track.name || ''}`;
    const isNotAdded = foundKeys.indexOf(key) < 0;
    if (isNotAdded) {
      foundKeys.push(key);
    }
    return isNotAdded;
  }).map(track => ({ id: track.id, language: track.lang || 'unknown', kind: '', label: track.name || 'unknown', origin: 'in-stream' })) : [];
};

const equalOrNoneSpecified = (a: ?(string | number), b: ?(string | number)) => (!a && !b) || a === b;
const equalOrNotSpecified = (a: ?(string | number), b: ?(string | number)) => (!a || !b) || a === b;

const isAudioTrackListsDifferent = (a: Array<AvailableTrack>, b: Array<AvailableTrack>) => {
  if (a.length === b.length) {
    for (let i = 0; i < a.length; i++) {
      if (!equalOrNoneSpecified(a[i].id, b[i].id) || !equalOrNoneSpecified(a[i].language, b[i].language) || !equalOrNoneSpecified(a[i].label, b[i].label)) {
        return true;
      }
    }
    return false;
  } else {
    return true;
  }
};

const getAudioTrackManager = (instanceKeeper: HlsjsInstanceKeeper, update: VideoStreamState => void): AudioTrackManager => {
  // let managedTracks: Array<ManagedAudioTrack> = [];
  let audioTracks: Array<AvailableTrack> = [];
  let hls;
  
  function mapAudioTracks() {
    // console.log(JSON.stringify(hls.audioTracks, (key, value) => key === 'details' ? undefined : value, 2), hls.audioTracks[0]);
    if (hls) {
      const currentTracks = getDistinctPseudoTracks(hls.audioTracks);
      if (isAudioTrackListsDifferent(currentTracks, audioTracks)) {
        audioTracks = currentTracks;
      }
    }
  }

  function updateStreamStateProps() {
    let currentAudioTrack = null;
    if (hls) {
      const currentHlsAudioTrack = hls.audioTracks.filter(ht => ht.id === hls.audioTrack)[0];
      if (currentHlsAudioTrack) {
        const { name, lang } = currentHlsAudioTrack;
        currentAudioTrack = audioTracks.filter(({ label, language }) => label === name && language === lang)[0];
      }
    }
    update({ audioTracks, currentAudioTrack });
  }

  function refresh() {
    mapAudioTracks();
    updateStreamStateProps();
  }

  function handleTrackChange() {
    mapAudioTracks();
    updateStreamStateProps();
  }

  function handleSelectedAudioTrackChange(selectedAudioTrack: ?AvailableTrack) {
    const st = selectedAudioTrack;
    if (hls && hls.audioTracks && st) {
      const groupId = (hls.audioTracks[hls.audioTrack] || {}).groupId;
      const matchingTrack = hls.audioTracks.filter(ht => equalOrNotSpecified(ht.groupId, groupId) && equalOrNotSpecified(ht.name, st.label) && equalOrNotSpecified(ht.lang, st.language))[0];
      if (matchingTrack) {
        hls.audioTrack = matchingTrack.id;
      }
    }
  }

  function reset() {
    audioTracks = [];
  }

  function handleSourceChange() {
    refresh();
  }

  const hlsjsEventHandlers = {
    [Hls.Events.MANIFEST_LOADING]: () => reset,
    [Hls.Events.MANIFEST_PARSED]: refresh,
    [Hls.Events.AUDIO_TRACK_SWITCHED]: handleTrackChange
  };

  function onHlsInstance(hlsInstance, preposition) {
    Object.entries(hlsjsEventHandlers).forEach(([name, handler]) => {
      // $FlowFixMe
      hlsInstance[preposition](name, handler);
      if (preposition === 'on') {
        hls = hlsInstance;
      }
    });
  }

  instanceKeeper.subscribers.push(onHlsInstance);
  
  return {
    cleanup: () => {},
    handleSourceChange,
    handleSelectedAudioTrackChange
  };
};

export default getAudioTrackManager;
