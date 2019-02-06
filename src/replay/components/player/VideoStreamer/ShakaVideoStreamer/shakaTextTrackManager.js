//@flow
import type { ShakaPlayer, ShakaTrack } from './types';
import type { AvailableTrack, PlaybackSource, SourceTrack, VideoStreamState } from '../types';
import { emptyTracks } from '../common/playbackLifeCycleManager';
import { isShallowEqual } from '../../../common';
import type { ManagedTextTrack } from '../BasicVideoStreamer/textTrackManager';
import type { TextTrackManager } from '../common/types';
import normalizeSource from '../common/sourceNormalizer';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

type ManagedShakaTextTrack = ManagedTextTrack & {
  shakaTrack: ?ShakaTrack,
  shakaLoadPromise?: Promise<?ShakaTrack>
};

function isEqual(a, b) {
  return a === b || (a == null && b == null ? true : Number.isNaN(a) && Number.isNaN(b));
}

const trackPropKeys = ['id', 'language', 'kind', 'label'];

function isShakaTrackEqual(a, b) {
  return (a && b && trackPropKeys.filter(key => isEqual(a[key], b[key])).length === trackPropKeys.length) || (!a && !b);
}

function createSelectableTrack(
  id: number,
  origin: 'in-stream' | 'side-loaded',
  shakaTrack: ShakaTrack
): AvailableTrack {
  const kind = shakaTrack.kind === 'subtitle' ? 'subtitles' : shakaTrack.kind || '';
  return {
    id,
    kind,
    label: shakaTrack.label || '',
    language: shakaTrack.language || '',
    origin
  };
}

const supportedContentTypes = ['text/vtt', 'application/ttml+xml'];

function isContentTypeSupported(sourceTrack) {
  const contentType = sourceTrack.contentType;
  return contentType && supportedContentTypes.filter(ct => contentType.indexOf(ct) === 0).length > 0;
}

function getShakaTextTrackManager(
  shakaPlayer: ShakaPlayer,
  updateStreamState: VideoStreamState => void
): TextTrackManager {
  let managedTextTracks: Array<ManagedShakaTextTrack> = [];
  let selectableTextTracks = emptyTracks;

  function getActiveShakaTrack() {
    return (shakaPlayer.getTextTracks() || []).filter(track => track.active)[0];
  }

  function update(allProps: boolean) {
    let currentTextTrack = null;
    const selectedTrack = shakaPlayer.isTextTrackVisible() ? getActiveShakaTrack() : null;
    if (selectedTrack) {
      const managedSelectedTrack = managedTextTracks.filter(
        managedTrack =>
          !managedTrack.isBlacklisted &&
          managedTrack.selectableTrack != null &&
          isShakaTrackEqual(managedTrack.shakaTrack, selectedTrack)
      )[0];
      currentTextTrack = managedSelectedTrack ? managedSelectedTrack.selectableTrack : null;
    }
    if (allProps) {
      const textTracks = managedTextTracks.filter(m => m.selectableTrack).map(m => m.selectableTrack);
      if (isShallowEqual(textTracks, selectableTextTracks)) {
        // $FlowFixMe Complaints about null entries, despite filter above.
        updateStreamState({
          textTracks: selectableTextTracks,
          currentTextTrack
        });
      } else {
        selectableTextTracks = textTracks;
        updateStreamState({
          textTracks,
          currentTextTrack
        });
      }
    } else {
      updateStreamState({
        currentTextTrack
      });
    }
  }

  function emptyManagedTextTrackList() {
    managedTextTracks.length = 0;
    update(true);
  }

  function ingestAndFilterEarlierAddedTracks(sourceTracks: Array<SourceTrack>) {
    return sourceTracks.filter(sourceTrack => {
      const managedTrackMatches = managedTextTracks.filter(
        managedTextTrack =>
          managedTextTrack.sourceTrack &&
          managedTextTrack.sourceTrack.src === sourceTrack.src &&
          managedTextTrack.shakaTrack
      );
      if (managedTrackMatches.length === 0) {
        return true;
      } else {
        const addedTrack = managedTrackMatches[0];
        const shakaTrack = addedTrack.shakaTrack;
        if (shakaTrack) {
          addedTrack.sourceTrack = sourceTrack;
          addedTrack.isBlacklisted = false;
          addedTrack.isLoaded = true;
          if (addedTrack.shakaTrack)
            addedTrack.selectableTrack = createSelectableTrack(
              addedTrack.shakaTrack.id,
              'side-loaded',
              addedTrack.shakaTrack
            );
          addedTrack.error = null;
          addedTrack.loadPromise = Promise.resolve();
          return false;
        }
        return false;
      }
    });
  }

  function updateManagedTrackListFromAddedTracks(tracksBeingAdded) {
    const newManagedTracks = tracksBeingAdded.map(trackBeingAdded => {
      const managedTrack: ManagedShakaTextTrack = {
        id: null,
        sourceTrack: trackBeingAdded.sourceTrack,
        shakaTrack: null,
        isBlacklisted: false, // When a track is explicitly added, we don't assume or check for duplicates, thus blacklisting should not be relevant.
        isLoaded: false,
        error: null,
        selectableTrack: null,
        shakaLoadPromise: trackBeingAdded.addPromise.then(
          shakaTrack => {
            managedTrack.isLoaded = true;
            managedTrack.shakaTrack = shakaTrack;
            managedTrack.selectableTrack = createSelectableTrack(shakaTrack.id, 'side-loaded', shakaTrack);
            return shakaTrack;
          },
          error => {
            managedTrack.error =
              error || new Error('Shaka rejected adding a track with the URL ' + trackBeingAdded.sourceTrack.src);
            managedTrack.isBlacklisted = true;
            managedTrack.isLoaded = true;
            return null;
          }
        )
      };
      return managedTrack;
    });
    managedTextTracks = managedTextTracks.concat(newManagedTracks);
    return Promise.all(newManagedTracks.map(nmt => nmt.shakaLoadPromise));
  }

  function selectShakaTrack(shakaTrack: ?ShakaTrack) {
    // setTextTrackVisibility() (and some other internal Shaka methods) is not dealing well with different text tracks having the same language code.
    // This method needs to complete async tasks (promises?) before we can select the correct track.
    if (shakaTrack) {
      shakaPlayer.removeEventListener('texttrackvisibility', shakaEventHandlers.texttrackvisibility);
      if (!shakaPlayer.isTextTrackVisible()) {
        shakaPlayer.setTextTrackVisibility(true);
      }
      window.setTimeout(() => {
        // Shaka tracks contain incomplete data and an updated version needs to be looked up:
        const fullShakaTrack = (shakaPlayer.getTextTracks() || []).filter(updatedTrack => {
          return isShakaTrackEqual(updatedTrack, shakaTrack);
        })[0];
        if (fullShakaTrack) {
          shakaPlayer.selectTextTrack(fullShakaTrack);
        } else {
          shakaTrack && shakaPlayer.selectTextTrack(shakaTrack);
        }
        update(false);
        shakaPlayer.addEventListener('texttrackvisibility', shakaEventHandlers.texttrackvisibility);
      }, 1);
    } else {
      if (shakaPlayer.isTextTrackVisible()) {
        shakaPlayer.setTextTrackVisibility(false);
      }
    }
  }

  function addTracks(tracks: Array<SourceTrack>) {
    const supportedTracks = tracks.filter(isContentTypeSupported);

    // We don't want updates to videoModel for each track during load.
    shakaPlayer.removeEventListener('trackschanged', shakaEventHandlers.trackschanged);

    // If the same source track was added earlier, and is readded, then just refurbish and un-blacklist the entry.
    const freshTracks = ingestAndFilterEarlierAddedTracks(supportedTracks);
    return updateManagedTrackListFromAddedTracks(
      freshTracks.map(sourceTrack => {
        let contentType = sourceTrack.contentType;
        const charsetPos = contentType ? contentType.indexOf(';charset') : -1;
        if (charsetPos > 0) {
          contentType = contentType && contentType.substr(0, charsetPos);
        }
        return {
          addPromise: shakaPlayer.addTextTrack(
            sourceTrack.src,
            sourceTrack.language,
            sourceTrack.kind,
            contentType,
            null,
            sourceTrack.label
          ),
          sourceTrack: sourceTrack
        };
      })
    ).then(() => {
      // Now we are ready again for other track change events coming from the stream etc.
      shakaPlayer.addEventListener('trackschanged', shakaEventHandlers.trackschanged);
      update(true);
    });
  }

  function updateFromShakaTextTracks() {
    const shakaTracks = shakaPlayer.getTextTracks() || [];
    //logger.debug('trackschanged fired.', shakaTracks);
    if (shakaTracks.length === 0) {
      // Don't spend CPU cycles comparing the old and new track list when the new list is empty.
      /*if (managedTextTracks.length === 0) {
        logger.debug('No Shaka text tracks reported.');
      } else {
        logger.debug('No Shaka text tracks reported. Emptying the list.');
      }*/
      emptyManagedTextTrackList();
    } else {
      // Keep existing managed tracks untouched. This includes blacklisting.
      const newManagedTrackList = managedTextTracks.filter(managedTrack => {
        const equalTracks = shakaTracks.filter(shakaTrack => isShakaTrackEqual(shakaTrack, managedTrack.shakaTrack));
        return equalTracks.length === 1;
      });

      const isRemoving = newManagedTrackList.length < managedTextTracks.length;
      const isAdding = shakaTracks.length > newManagedTrackList.length;

      if (isAdding) {
        const freshTracks = shakaTracks.filter(shakaTrack => {
          const equalTracks = newManagedTrackList.filter(managedTrack =>
            isShakaTrackEqual(shakaTrack, managedTrack.shakaTrack)
          );
          return equalTracks.length === 0;
        });
        const newManagedTracks = freshTracks.map(shakaTrack => ({
          sourceTrack: null,
          shakaTrack: shakaTrack,
          isBlacklisted: false,
          selectableTrack: createSelectableTrack(shakaTrack.id, 'in-stream', shakaTrack),
          isLoaded: true,
          error: null
        }));
        managedTextTracks = newManagedTrackList.concat(newManagedTracks);
        update(true);
      } else if (isRemoving) {
        managedTextTracks = newManagedTrackList;
        update(true);
      }
    }
  }

  function blacklistExistingSideLoadedTracks() {
    const selectedTrack = shakaPlayer.isTextTrackVisible() ? getActiveShakaTrack() : null;
    managedTextTracks
      .filter(managedTrack => {
        return managedTrack.sourceTrack != null;
      })
      .forEach(managedTrack => {
        if (managedTrack.selectableTrack) {
          managedTrack.selectableTrack = null;
        }
        if (
          selectedTrack &&
          managedTrack.shakaTrack &&
          managedTrack.shakaTrack.active &&
          isShakaTrackEqual(selectedTrack, managedTrack.shakaTrack)
        ) {
          shakaPlayer.setTextTrackVisibility(false);
        }
        managedTrack.isBlacklisted = true;
      });
  }

  function handleSourcePropChange(props: { source?: ?PlaybackSource, textTracks?: ?Array<SourceTrack> }) {
    let newTracks = Array.isArray(props.textTracks) ? props.textTracks : [];
    const source = normalizeSource(props.source);
    if (source && source.textTracks) {
      addTracks(newTracks.concat(source.textTracks));
    } else {
      addTracks(newTracks);
    }
  }

  function handleTextTracksPropChange(props: { source?: ?PlaybackSource, textTracks?: ?Array<SourceTrack> }) {
    blacklistExistingSideLoadedTracks();
    let newTracks = Array.isArray(props.textTracks) ? props.textTracks : [];
    addTracks(newTracks);
  }

  function clear() {
    blacklistExistingSideLoadedTracks();
  }

  function handleSelectedTextTrackChange(textTrack: ?AvailableTrack) {
    const managedTrack = textTrack && managedTextTracks.filter(mt => mt.selectableTrack === textTrack)[0];
    selectShakaTrack(managedTrack && managedTrack.shakaTrack);
  }

  const shakaEventHandlers = {
    loading: emptyManagedTextTrackList,
    trackschanged: updateFromShakaTextTracks,
    texttrackvisibility: () => update(false)
  };

  function cleanup() {
    emptyManagedTextTrackList();
    Object.entries(shakaEventHandlers).forEach(([name, handler]) => {
      shakaPlayer.removeEventListener(name, handler);
    });
  }

  Object.entries(shakaEventHandlers).forEach(([name, handler]) => {
    shakaPlayer.addEventListener(name, handler);
  });

  return {
    handleSelectedTextTrackChange,
    handleTextTracksPropChange,
    handleSourcePropChange,
    clear,
    cleanup
  };
}

export default getShakaTextTrackManager;
