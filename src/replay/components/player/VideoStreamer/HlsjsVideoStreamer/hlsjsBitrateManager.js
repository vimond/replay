// @flow
import type { InitialPlaybackProps, VideoStreamState } from '../types';
import { isShallowEqual } from '../../../common';
import type { HlsjsQualityLevel } from 'hls.js';
import Hls from 'hls.js';
import type { HlsjsInstanceKeeper } from './HlsjsVideoStreamer';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

type PropsWithInitial = {
  initialPlaybackProps?: InitialPlaybackProps,
  configuration?: any
};

function getBitrateAsKbps(level: HlsjsQualityLevel) {
  return (level && Math.ceil(level.bitrate / 1000)) || 0;
}

function manualBitrateSwitch(hls, configuration, switchTrackId) {
  const { manualBitrateSwitchStrategy } = configuration || {};
  if (manualBitrateSwitchStrategy === "instant-switch") {
    hls.currentLevel = switchTrackId;
  } else {
    hls.nextLevel = switchTrackId;
  }
}

const getHlsjsBitrateManager = <P: PropsWithInitial>(
  streamer: { props: P },
  instanceKeeper: HlsjsInstanceKeeper,
  updateStreamState: VideoStreamState => void,
  log?: ?(string, any) => void
) => {
  let previousBitrates = [];
  let hls;

  function updateBitrateProps(hlsEvent, eventData) {
    if (hls) {
      let bitrates = Array.isArray(hls.levels) ? hls.levels.map(getBitrateAsKbps) : [];
      if (isShallowEqual(previousBitrates, bitrates)) {
        bitrates = previousBitrates;
      }
      const currentLevel =
        hlsEvent === Hls.Events.LEVEL_SWITCHED
          ? eventData.level
          : hls.currentLevel === -1
          ? hls.startLevel
          : hls.currentLevel;
      if (currentLevel === -1) {
        log && log('No hls.js level reported currently or selected for start.');
        updateStreamState({
          bitrates
        });
      } else {
        const currentBitrate = getBitrateAsKbps(hls.levels[currentLevel]);
        updateStreamState({
          currentBitrate,
          bitrates
        });
      }
    }
  }

  function capBitrate(cap: ?number) {
    if (hls) {
      if (isNaN(cap) || cap === Infinity || cap == null || cap < 0) {
        log && log('Resetting restrictions for bitrate.');
        hls.autoLevelCapping = -1;
        updateStreamState({ bitrateCap: null });
      } else {
        if (Array.isArray(hls.levels)) {
          let reached = false;
          for (let i = 0; i < hls.levels.length; i++) {
            const bitrate = getBitrateAsKbps(hls.levels[i]);
            if (bitrate === cap) {
              hls.autoLevelCapping = i;
              updateStreamState({ bitrateCap: getBitrateAsKbps(hls.levels[i]) });
              log && log('Desired bitrate cap ' + cap + ' is equal to level on index ' + i + ' in hls.js.', hls.levels);
              reached = true;
              break;
            } else if (bitrate > cap) {
              if (i > 0) {
                hls.autoLevelCapping = i - 1;
                updateStreamState({ bitrateCap: getBitrateAsKbps(hls.levels[i - 1]) });
                log &&
                  log(
                    'Desired bitrate cap ' + cap + ' is closest to level on index ' + (i - 1) + ' in hls.js.',
                    hls.levels
                  );
              } else {
                hls.autoLevelCapping = 0;
                log &&
                  log(
                    'Desired bitrate cap ' +
                      cap +
                      ' appears to be lower than the lowest HLS level. Aligning to lowest level.',
                    hls.levels
                  );
                updateStreamState({ bitrateCap: getBitrateAsKbps(hls.levels[0]) });
              }
              reached = true;
              break;
            }
          }
          if (!reached) {
            log &&
              log('Desired bitrate cap appears to be higher than the higher HLS level. Not applicable.', hls.levels);
          }
        } else {
          log && log('Found no HLS levels from where bitrate capping can be applied.', hls.levels);
        }
      }
    }
  }

  function fixBitrate(bitrate: ?(number | 'max' | 'min')) {
    if (hls) {
      const { configuration } = streamer.props;
      if (bitrate === 'min') {
        if (Array.isArray(hls.levels) && hls.levels.length > 0) {
          manualBitrateSwitch(hls, configuration, 0);
          updateStreamState({ bitrateFix: getBitrateAsKbps(hls.levels[0]) });
          log && log('Fixing bitrate to lowest level out of ' + hls.levels.length);
        }
      } else if (bitrate === 'max') {
        if (Array.isArray(hls.levels) && hls.levels.length > 0) {
          manualBitrateSwitch(hls, configuration, hls.levels.length - 1);
          updateStreamState({ bitrateFix: getBitrateAsKbps(hls.levels[hls.levels.length - 1]) });
          log && log('Fixing bitrate to highest level out of ' + hls.levels.length);
        }
      } else if (bitrate == null || bitrate === Infinity || isNaN(bitrate) || bitrate < 0 || !bitrate) {
        log && log('Resetting fixing of bitrate.');
        manualBitrateSwitch(hls, configuration, -1);
        updateStreamState({ bitrateFix: null });
      } else if (typeof bitrate === 'string') {
        log &&
          log(
            'Unknown string specified for bitrate lock. Please use a value of type number if a bitrate specified by kbps is intended.',
            bitrate
          );
      } else {
        if (Array.isArray(hls.levels)) {
          for (var i = 0; i < hls.levels.length; i++) {
            if (getBitrateAsKbps(hls.levels[i]) === bitrate) {
              manualBitrateSwitch(hls, configuration, i);
              log && log('Fixing bitrate to HLS level ' + i, hls.levels);
              updateStreamState({ bitrateFix: bitrate });
              return;
            }
          }
          log &&
            log(
              "Desired bitrate lock didn't match any bitrates specified in the hls.levels list. Not applied.",
              hls.levels
            );
        } else {
          log && log('Found no HLS levels from where bitrate fixing can be applied.', hls.levels);
        }
      }
    }
  }

  const hlsjsEventHandlers = {
    [Hls.Events.MANIFEST_LOADING]: () => {
      previousBitrates = [];
    },
    [Hls.Events.MANIFEST_PARSED]: updateBitrateProps,
    [Hls.Events.LEVEL_SWITCHED]: updateBitrateProps,
    [Hls.Events.LEVEL_UPDATED]: updateBitrateProps
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
    fixBitrate,
    capBitrate
  };
};

export default getHlsjsBitrateManager;
