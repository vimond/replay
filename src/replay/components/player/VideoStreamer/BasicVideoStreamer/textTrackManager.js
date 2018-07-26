// @flow

import type { AvailableTrack, PlaybackSource, SourceTrack, VideoStreamState } from '../types';

type ManagedTextTrack = {
  isBlackListed: boolean,
  sourceTrack: ?SourceTrack,
  videoElementTrack: ?TextTrack,
  selectableTrack: ?AvailableTrack,
  loadPromise?: Promise<?TextTrack>,
  isLoaded: boolean,
  error?: any
};

type HTMLTextTrackMode = 'disabled' | 'hidden' | 'showing';

export type TextTrackManager = {
  handleSelectedTextTrackChange: (?AvailableTrack) => void,
  handleNewSourceProps: ({ source?: ?PlaybackSource, textTracks?: ?Array<SourceTrack> }) => void,
  cleanup: () => void
}

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
    kind: videoElementTrack.kind,
    label: videoElementTrack.label,
    language: videoElementTrack.language,
    origin
  };
}

function createTrackElement(sourceTrack: SourceTrack): HTMLTrackElement {
  const htmlTrackElement = document.createElement('track');
  htmlTrackElement.kind = sourceTrack.kind || 'subtitles';
  htmlTrackElement.src = sourceTrack.src;
  if (sourceTrack.language) {
    htmlTrackElement.srclang = sourceTrack.language;
  }
  if (sourceTrack.label) {
    htmlTrackElement.label = sourceTrack.label;
  }
  return htmlTrackElement;
}

const getTextTrackManager = (videoElement: HTMLVideoElement, update: VideoStreamState => void) => {
  let managedTracks: Array<ManagedTextTrack> = [];
  let unique = 0;
  const Cue = window.VTTCue || window.TextTrackCue;
  const isDesktopSafari =
    navigator.userAgent.indexOf('Chrome') < 0 &&
    navigator.userAgent.indexOf('Edge') < 0 &&
    navigator.userAgent.indexOf('Safari') > 0 &&
    navigator.userAgent.indexOf('iPhone') < 0 &&
    navigator.userAgent.indexOf('iPad') < 0;

  function notifyPropertyChanges() {
    const currentTextTrack = managedTracks
      .filter(m => m.videoElementTrack != null && getTrackMode(m.videoElementTrack) === 'showing')
      .map(m => m.selectableTrack)[0];
    // $FlowFixMe Null props filtered away not recognised.
    update({
      currentTextTrack,
      textTracks: managedTracks.filter(m => m.selectableTrack).map(m => m.selectableTrack)
    });
  }

  function addTracks(sourceTracks?: Array<SourceTrack>) {
    if (Array.isArray(sourceTracks)) {
      videoElement.removeEventListener('addtrack', handleTrackAdd);
      videoElement.removeEventListener('removetrack', handleTrackRemove);

      const freshSourceTracks = sourceTracks.filter(sourceTrack => {
        const managedTrackMatches = managedTracks.filter(managedTrack => {
          return isSourceTracksEqual(managedTrack.sourceTrack, sourceTrack) && !managedTrack.isBlackListed;
        });
        if (managedTrackMatches.length === 0) {
          return true;
        } else {
          const alreadyAddedTrack = managedTrackMatches[0];
          alreadyAddedTrack.sourceTrack = sourceTrack;
          alreadyAddedTrack.isBlackListed = false;
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
            isBlackListed: false,
            videoElementTrack,
            selectableTrack: createSelectableTrack(id, 'side-loaded', videoElementTrack),
            loadPromise: Promise.resolve(videoElementTrack),
            isLoaded: true
          };
        } else {
          const htmlTrackElement = createTrackElement(sourceTrack);
          const loadPromise = new Promise(resolve => {
            const handleLoad = () => {
              htmlTrackElement.removeEventListener('load', handleLoad);
              htmlTrackElement.removeEventListener('error', handleError);
              resolve(htmlTrackElement.track);
            };
            const handleError = () => {
              htmlTrackElement.removeEventListener('load', handleLoad);
              htmlTrackElement.removeEventListener('error', handleError);
              resolve();
            };
            htmlTrackElement.addEventListener('load', handleLoad);
            htmlTrackElement.addEventListener('error', handleError);
            if (isDesktopSafari) {
              setTimeout(function() {
                videoElement.appendChild(htmlTrackElement);
              }, 1);
            } else {
              videoElement.appendChild(htmlTrackElement);
            }
          });
          const managedTrack = {
            id,
            sourceTrack,
            isBlackListed: false,
            videoElementTrack: undefined,
            selectableTrack: undefined,
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
      
      return Promise.all(freshManagedTracks.map(managedTrack => managedTrack.loadPromise)).then(() => {
        videoElement.addEventListener('addtrack', handleTrackAdd);
        videoElement.addEventListener('removetrack', handleTrackRemove);
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

    // TODO: Could there be async considerations with source tracks not added as textTracks yet?
    const cleanedUpManagedTracks = managedTracks.filter(managedTrack => {
      return videoElementTracks.indexOf(managedTrack.videoElementTrack) >= 0;
    });

    //const isRemoving = cleanedUpManagedTracks.length < managedTracks.length;
    //const isAdding = videoElementTracks.length > cleanedUpManagedTracks.length;

    if (videoElementTracks.length > cleanedUpManagedTracks.length) {
      const freshVideoElementTracks = videoElementTracks.filter(videoElementTrack => {
        return (cleanedUpManagedTracks.filter(function(managedTrack) {
          return videoElementTrack === managedTrack.videoElementTrack;
        }).length === 0);
      });
      const freshManagedTracks: Array<ManagedTextTrack> = freshVideoElementTracks.map(videoElementTrack => {
        const id = ++unique;
        return {
          id,
          sourceTrack: null,
          videoElementTrack,
          isBlackListed: false,
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
        m.isBlackListed = true;
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
  }
  

  function handleNewSourceProps(newProps: { source?: ?PlaybackSource, textTracks?: ?Array<SourceTrack> }) {
    if ('source' in newProps) {
      cleanupTracks(true);
    } else if ('textTracks' in newProps) {
      cleanupTracks(false);
    }
    let newTracks = Array.isArray(newProps.textTracks) ? newProps.textTracks : [];
    if (newProps.source && newProps.source.textTracks) {
      addTracks(newTracks.concat(newProps.source.textTracks));
    } else {
      addTracks(newTracks);
    }
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
    videoElement.removeEventListener('addtrack', handleTrackAdd);
    videoElement.removeEventListener('removetrack', handleTrackRemove);
  }

  function initialize() {
    videoElement.addEventListener('addtrack', handleTrackAdd);
    videoElement.addEventListener('removetrack', handleTrackRemove);
  }

  initialize();

  return {
    handleSelectedTextTrackChange,
    handleNewSourceProps,
    cleanup
  };
};

export default getTextTrackManager;
