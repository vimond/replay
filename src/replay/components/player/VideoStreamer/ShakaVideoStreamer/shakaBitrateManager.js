// @flow
import type { ShakaPlayer, ShakaTrack } from './types';
import type { InitialPlaybackProps, VideoStreamState } from '../types';
import { isShallowEqual } from '../../../common';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

type PropsWithInitial = {
  initialPlaybackProps?: InitialPlaybackProps
};

function getBitrateAsBps(track) {
  return (track && track.bandwidth) || 0;
}

function numericSort(a, b) {
  return a - b;
}

function bandwidthSort(a: ShakaTrack, b: ShakaTrack) {
  return a.bandwidth - b.bandwidth;
}

function getBitrateAsKbps(track: ShakaTrack) {
  return (track && Math.ceil(track.bandwidth / 1000)) || 0;
}

function isActiveTrack(track: ShakaTrack) {
  return track && track.active && track.type === 'variant';
}

function isUnique(item, index, arr) {
  return arr.indexOf(item) === index;
}

const resetConfiguration = { abr: { enabled: true, restrictions: { maxBandwidth: Infinity } } };

const getShakaBitrateManager = <P: PropsWithInitial>(
  streamer: { props: P },
  shakaPlayer: ShakaPlayer,
  updateStreamState: VideoStreamState => void,
  log?: ?(string, any) => void
) => {
  let previousBitrates = [];

  function updateBitrateProps() {
    let variantTracks: Array<ShakaTrack> = shakaPlayer.getVariantTracks();
    /*const maxBandwidth = shakaPlayer.getConfiguration().abr['restrictions'] && shakaPlayer.getConfiguration().abr['restrictions'].maxBandwidth;
    if (maxBandwidth && maxBandwidth !== Infinity && variantTracks.length > previousVariantTracks.length) {
      variantTracks = previousVariantTracks;
    }// else {
    // previousVariantTracks = variantTracks;
    //}*/
    const currentBitrate = getBitrateAsKbps(variantTracks.filter(isActiveTrack)[0]);
    const bitrates = variantTracks
      .map(getBitrateAsKbps)
      .filter(isUnique)
      .sort(numericSort);

    const updates: Object = {};
    if (currentBitrate) {
      updates.currentBitrate = getBitrateAsKbps(variantTracks.filter(isActiveTrack)[0]);
    }
    if (!isShallowEqual(previousBitrates, bitrates)) {
      previousBitrates = bitrates;
      updates.bitrates = bitrates;
    }
    if (Object.keys(updates).length > 0) {
      updateStreamState(updates);
    }
  }

  function capBitrate(cap: ?number) {
    if (isNaN(cap) || cap === Infinity || cap == null || cap < 0) {
      log && log('Resetting restrictions for bitrate.');
      shakaPlayer.configure(resetConfiguration);
      updateStreamState({ maxBitrate: null });
    } else {
      const lowestBitrate = shakaPlayer
        .getVariantTracks()
        .map(getBitrateAsBps)
        .sort(numericSort)[0];
      if (lowestBitrate) {
        const maxBandwidth = Math.max(cap * 1000, lowestBitrate);
        const restrictions = { maxBandwidth };
        shakaPlayer.configure({ abr: { enabled: true, restrictions: restrictions } });
        updateStreamState({ maxBitrate: Math.ceil(maxBandwidth / 1000) });
        if (restrictions.maxBandwidth === lowestBitrate) {
          log && log('Applying restrictions for bitrate, but aligning to lowest available bitrate.', restrictions);
        } else {
          log && log('Applying restrictions for bitrate.', restrictions);
        }
      } else {
        log &&
          log(
            'Bitrate range not found. Not safe to applying restrictions for bitrate.',
            shakaPlayer.getVariantTracks()
          );
      }
    }
  }

  function lockBitrate(bitrate: ?(number | 'max' | 'min')) {
    if (typeof bitrate === 'string') {
      try {
        const sortedTracks = shakaPlayer
          .getVariantTracks()
          .slice(0)
          .sort(bandwidthSort);
        const desiredVariantTrack =
          bitrate === 'min' ? sortedTracks[0] : bitrate === 'max' ? sortedTracks[sortedTracks.length - 1] : null;
        if (desiredVariantTrack) {
          shakaPlayer.configure({ abr: { enabled: false, restrictions: { maxBandwidth: Infinity } } });
          shakaPlayer.selectVariantTrack(desiredVariantTrack);
          updateStreamState({ lockedBitrate: getBitrateAsKbps(desiredVariantTrack) });
        } else {
          shakaPlayer.configure(resetConfiguration);
          updateStreamState({ lockedBitrate: null });
          log &&
            log(
              'Unknown string specified for bitrate lock. Please use a value of type number if a bitrate specified by kbps is intended.',
              bitrate
            );
        }
      } catch (e) {
        shakaPlayer.configure(resetConfiguration);
        updateStreamState({ lockedBitrate: null });
        log &&
          log(
            'Attempting to set ' + bitrate + 'imum bitrate, but no tracks found. A bit too early, maybe?',
            shakaPlayer.getVariantTracks()
          );
      }
    } else if (isNaN(bitrate) || bitrate == null || bitrate < 0 || !bitrate) {
      shakaPlayer.configure(resetConfiguration);
      updateStreamState({ lockedBitrate: null });
      log && log('Resetting bitrate locking.');
    } else {
      const matchingTrack = shakaPlayer.getVariantTracks().filter(function(track) {
        return getBitrateAsKbps(track) === bitrate;
      })[0];
      if (matchingTrack) {
        shakaPlayer.configure({ abr: { enabled: false, restrictions: { maxBandwidth: Infinity } } });
        shakaPlayer.selectVariantTrack(matchingTrack);
        updateStreamState({ lockedBitrate: getBitrateAsKbps(matchingTrack) });
        log && log('Locking at bitrate ' + bitrate + '.', matchingTrack);
      } else {
        shakaPlayer.configure(resetConfiguration);
        updateStreamState({ lockedBitrate: null });
        log &&
          log(
            'Could not finding matching track for specified lock bitrate ' + bitrate + '.',
            shakaPlayer.getVariantTracks()
          );
      }
    }
  }

  const shakaEventHandlers = {
    loading: () => {
      previousBitrates = [];
    },
    streaming: updateBitrateProps,
    adaptation: updateBitrateProps,
    trackschanged: updateBitrateProps
  };

  Object.entries(shakaEventHandlers).forEach(([name, handler]) => {
    shakaPlayer.addEventListener(name, handler);
  });

  function cleanup() {
    Object.entries(shakaEventHandlers).forEach(([name, handler]) => {
      shakaPlayer.removeEventListener(name, handler);
    });
  }

  return {
    cleanup,
    lockBitrate,
    capBitrate
  };
};

export default getShakaBitrateManager;
