// @flow

import type { AvailableTrack, PlaybackSource, SourceTrack, VideoStreamState } from '../types';
import { emptyTracks } from '../common/playbackLifeCycleManager';
import { isShallowEqual } from '../../../common';
import type { TextTrackManager, TrackElementData } from '../common/types';
import normalizeSource from '../common/sourceNormalizer';

export type ManagedTextTrack = {
  isBlacklisted: boolean,
  sourceTrack: ?SourceTrack,
  videoElementTrack?: ?TextTrack,
  selectableTrack: ?AvailableTrack,
  trackElementData?: ?TrackElementData,
  loadPromise?: Promise<?TextTrack>,
  isLoaded: boolean,
  error?: any
};

type HTMLTextTrackMode = 'disabled' | 'hidden' | 'showing';

/*export type TextTracksStateProps = {
  currentTextTrack?: ?AvailableTrack,
  textTracks?: Array<AvailableTrack>
};*/

const trackModeMappings = ['disabled', 'hidden', 'showing']; // Index corresponds with "enum" value.

function getTrackMode(textTrack: TextTrack) {
  const mode = textTrack.mode;
  return typeof mode === 'number' ? trackModeMappings[mode] : mode;
}

function setTrackMode(textTrack: TextTrack, newMode: HTMLTextTrackMode) {
  // $FlowFixMe Some browsers use numbers mapping to modes.
  textTrack.mode = typeof textTrack.mode === 'number' ? trackModeMappings.indexOf(newMode) : newMode;
}

function isEqual(a: any, b: any): boolean {
  return (Number.isNaN(a) && Number.isNaN(b)) || (a == null && b == null) || a === b;
}

function isVideoElementTrackValid(textTrack: TextTrack) {
  // Detecting empty dummy tracks originating from HLS streams in Safari.
  return !('inBandMetadataTrackDispatchType' in textTrack) || (textTrack.cues && textTrack.cues.length) || textTrack.label || textTrack.language;
}

function isSourceTracksEqual(a: ?SourceTrack, b: ?SourceTrack): boolean {
  if (a && b) {
    if (a.cues && b.cues) {
      const ac = a.cues,
        bc = b.cues;
      if (ac.length === bc.length) {
        const isCuesDifferent =
          ac.filter(
            (cue, index) =>
              cue.start === bc[index].start && cue.end === bc[index].end && cue.content === bc[index].content
          ).length !== ac.length;
        if (isCuesDifferent) {
          return false;
        }
      }
    }
    return (
      isEqual(a.language, b.language) && isEqual(a.kind, b.kind) && isEqual(a.label, b.label) && isEqual(a.src, b.src)
    );
  } else {
    return isEqual(a, b);
  }
}

function createSelectableTrack(
  id: number,
  origin: 'in-stream' | 'side-loaded',
  videoElementTrack: TextTrack
): AvailableTrack {
  return {
    id,
    kind: videoElementTrack.kind || '',
    label: videoElementTrack.label || '',
    language: videoElementTrack.language || '',
    origin
  };
}

const getTextTrackManager = (
  videoElement: HTMLVideoElement,
  update: <T: VideoStreamState>(props: T) => void,
  updateTrackElementData: (Array<TrackElementData>) => void
): TextTrackManager => {
  // Should use TextTracksStateProps above.
  let managedTracks: Array<ManagedTextTrack> = [];
  let currentTextTrack = null;
  let selectableTextTracks = emptyTracks;
  let unique = 0;
  const Cue = window.VTTCue || window.TextTrackCue;

  function notifyPropertyChanges() {
    currentTextTrack = managedTracks
      .filter(m => m.videoElementTrack != null && getTrackMode(m.videoElementTrack) === 'showing')
      .map(m => m.selectableTrack)[0];

    const textTracks = managedTracks.filter(m => m.selectableTrack).map(m => m.selectableTrack);
    if (isShallowEqual(textTracks, selectableTextTracks)) {
      // $FlowFixMe Complaints about null entries, despite filter above.
      update({
        currentTextTrack,
        textTracks: selectableTextTracks
      });
    } else {
      selectableTextTracks = textTracks;
      update({
        currentTextTrack,
        textTracks
      });
    }
  }

  function addTracks(sourceTracks?: Array<SourceTrack>) {
    if (Array.isArray(sourceTracks)) {
      videoElement.textTracks.removeEventListener('addtrack', handleTrackAdd);
      videoElement.textTracks.removeEventListener('removetrack', handleTrackRemove);

      const freshSourceTracks = sourceTracks.filter(sourceTrack => {
        const managedTrackMatches = managedTracks.filter(managedTrack => {
          return isSourceTracksEqual(managedTrack.sourceTrack, sourceTrack) && !managedTrack.isBlacklisted;
        });
        if (managedTrackMatches.length === 0) {
          return true;
        } else {
          const alreadyAddedTrack = managedTrackMatches[0];
          alreadyAddedTrack.sourceTrack = sourceTrack;
          alreadyAddedTrack.isBlacklisted = false;
          alreadyAddedTrack.isLoaded = true; // Is this assumption correct?
          return false;
        }
      });

      const freshManagedTracks: Array<ManagedTextTrack> = freshSourceTracks.map(sourceTrack => {
        const id = ++unique;
        if (Array.isArray(sourceTrack.cues)) {
          const cues = sourceTrack.cues;
          const videoElementTrack = videoElement.addTextTrack(
            sourceTrack.kind || 'subtitles',
            sourceTrack.label,
            sourceTrack.language
          );
          cues.forEach(cue => {
            videoElementTrack.addCue(new Cue(cue.start, cue.end, cue.content));
          });
          return {
            id,
            sourceTrack,
            isBlacklisted: false,
            videoElementTrack,
            selectableTrack: createSelectableTrack(id, 'side-loaded', videoElementTrack),
            loadPromise: Promise.resolve(videoElementTrack),
            isLoaded: true
          };
        } else {
          const trackElementData: TrackElementData = {
            src: sourceTrack.src,
            srclang: sourceTrack.language,
            kind: sourceTrack.kind || 'subtitles',
            label: sourceTrack.label
          };
          const loadPromise = new Promise(resolve => {
            trackElementData.onRef = (trackElement: ?HTMLTrackElement) => {
              const t = trackElement;
              if (t) {
                setTrackMode(t.track, 'hidden');
                const handleLoad = () => {
                  t.removeEventListener('load', handleLoad);
                  t.removeEventListener('error', handleError);
                  resolve(t.track);
                };
                const handleError = (e: Event) => {
                  t.removeEventListener('load', handleLoad);
                  t.removeEventListener('error', handleError);
                  resolve();
                };
                t.addEventListener('load', handleLoad);
                t.addEventListener('error', handleError);
              }
            };
          });
          const managedTrack = {
            id,
            sourceTrack,
            isBlacklisted: false,
            videoElementTrack: undefined,
            selectableTrack: undefined,
            trackElementData,
            loadPromise,
            isLoaded: false
          };
          loadPromise.then(videoElementTrack => {
            if (videoElementTrack != null) {
              managedTrack.videoElementTrack = videoElementTrack;
              managedTrack.selectableTrack = createSelectableTrack(id, 'side-loaded', videoElementTrack);
            }
            managedTrack.isLoaded = true;
          });
          return managedTrack;
        }
      });

      managedTracks = managedTracks.concat(freshManagedTracks);

      // $FlowFixMe Filtering away null/undefined isn't recognised.
      updateTrackElementData(managedTracks.filter(t => t.trackElementData && !t.isBlacklisted).map(t => t.trackElementData));

      return Promise.all(freshManagedTracks.map(managedTrack => managedTrack.loadPromise)).then(() => {
        videoElement.textTracks.addEventListener('addtrack', handleTrackAdd);
        videoElement.textTracks.addEventListener('removetrack', handleTrackRemove);
        notifyPropertyChanges();
      });
    } else {
      return Promise.resolve();
    }
  }

  function updateFromVideoElement(textTracksList: TextTrackList) {
    if (textTracksList.length === 0 && managedTracks.length === 0) {
      return;
    }

    const videoElementTracks: Array<TextTrack> = [];
    for (let i = 0; i < textTracksList.length; i++) {
      // Awkward for-loop because Flow doesn't understand Array.from().
      videoElementTracks.push(textTracksList[i]);
    }

    const cleanedUpManagedTracks = managedTracks.filter(managedTrack => {
      return videoElementTracks.indexOf(managedTrack.videoElementTrack) >= 0;
    });

    //const isRemoving = cleanedUpManagedTracks.length < managedTracks.length;
    //const isAdding = videoElementTracks.length > cleanedUpManagedTracks.length;

    if (videoElementTracks.length > cleanedUpManagedTracks.length) {
      const freshVideoElementTracks = videoElementTracks.filter(videoElementTrack =>
        isVideoElementTrackValid(videoElementTrack) && cleanedUpManagedTracks.filter(function(managedTrack) {
          return videoElementTrack === managedTrack.videoElementTrack;
        }).length === 0);
      const freshManagedTracks: Array<ManagedTextTrack> = freshVideoElementTracks.map(videoElementTrack => {
        const id = ++unique;
        return {
          id,
          sourceTrack: null,
          videoElementTrack,
          isBlacklisted: false,
          selectableTrack: createSelectableTrack(id, 'in-stream', videoElementTrack),
          isLoaded: true
        };
      });
      managedTracks = cleanedUpManagedTracks.concat(freshManagedTracks);
    } else {
      managedTracks = cleanedUpManagedTracks;
    }
  }

  function cleanupTracks(isNewSession: boolean) {
    updateFromVideoElement(videoElement.textTracks);
    managedTracks.forEach(m => {
      // Blacklisting and removing side-loaded tracks.
      if (isNewSession || m.sourceTrack != null) {
        m.isBlacklisted = true;
      }
      if (m.videoElementTrack != null && isNewSession) {
        const vt = m.videoElementTrack;
        if (vt.cues) {
          while (vt.cues.length) {
            vt.removeCue(vt.cues[0]);
          }
        }
        setTrackMode(vt, 'disabled');
      }
      m.selectableTrack = null;
    });
    selectableTextTracks = emptyTracks;
    updateTrackElementData([]);
  }

  function handleSourcePropChange(newProps: { source?: ?PlaybackSource, textTracks?: ?Array<SourceTrack> }) {
    updateFromVideoElement(videoElement.textTracks);
    const newTracks = newProps.source && Array.isArray(newProps.textTracks) ? newProps.textTracks : [];
    const source = normalizeSource(newProps.source);
    if (source && source.textTracks) {
      addTracks(newTracks.concat(source.textTracks));
    } else {
      addTracks(newTracks);
    }
  }

  function handleTextTracksPropChange(newProps: { source?: ?PlaybackSource, textTracks?: ?Array<SourceTrack> }) {
    cleanupTracks(false);
    const newTracks = newProps.source && Array.isArray(newProps.textTracks) ? newProps.textTracks : [];
    addTracks(newTracks);
  }

  function clear() {
    cleanupTracks(true);
  }

  function handleSelectedTextTrackChange(selectedTextTrack: ?AvailableTrack) {
    managedTracks
      .filter(mt => mt.videoElementTrack && getTrackMode(mt.videoElementTrack) === 'showing')
      .forEach(mt => mt.videoElementTrack && setTrackMode(mt.videoElementTrack, 'hidden'));
    if (selectedTextTrack) {
      const managedTrack = managedTracks.filter(mt => mt.selectableTrack === selectedTextTrack)[0];
      if (managedTrack && managedTrack.videoElementTrack) {
        setTrackMode(managedTrack.videoElementTrack, 'showing');
      }
    }
    notifyPropertyChanges();
  }

  function handleTrackAdd() {
    updateFromVideoElement(videoElement.textTracks);
    notifyPropertyChanges();
  }

  function handleTrackRemove() {
    updateFromVideoElement(videoElement.textTracks);
    notifyPropertyChanges();
  }

  function cleanup() {
    videoElement.textTracks.removeEventListener('addtrack', handleTrackAdd);
    videoElement.textTracks.removeEventListener('removetrack', handleTrackRemove);
  }

  function initialize() {
    videoElement.textTracks.addEventListener('addtrack', handleTrackAdd);
    videoElement.textTracks.addEventListener('removetrack', handleTrackRemove);
  }

  initialize();

  return {
    handleSelectedTextTrackChange,
    handleTextTracksPropChange,
    handleSourcePropChange,
    clear,
    cleanup
  };
};

export default getTextTrackManager;
