// @flow
import { type VideoStreamState } from '../types';
import { isDifferent } from '../../../common';
import type { VideoStreamerImplProps, VideoStreamStateKeys, VideoStreamStateValues } from '../types';
import type { SimplifiedVideoStreamer } from './types';
import type { VideoStreamerConfiguration } from '../types';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

const saneNumberFilter = <T>(value: ?T) =>
  value == null || isNaN(value) || value === Infinity || typeof value !== 'number' || value < 0 ? 0 : value;

const defaultFilters = {
  position: saneNumberFilter,
  duration: saneNumberFilter,
  volume: saneNumberFilter
};

export type SanityFilter = <T: ?VideoStreamStateValues>(val: T) => T;

function getFilteredStreamStateUpdater<C: VideoStreamerConfiguration, P: VideoStreamerImplProps<C>>(
  videoStreamer: SimplifiedVideoStreamer<C, P>,
  filters: { [VideoStreamStateKeys]: SanityFilter } = defaultFilters
) {
  const currentValues: VideoStreamState = {};

  function update(property: VideoStreamState) {
    const callback = videoStreamer.props && videoStreamer.props.onStreamStateChange;
    if (callback) {
      // $FlowFixMe Yet to understand how to safely iterate through objects as maps.
      Object.entries(property).forEach(([key, value]) => {
        const saneValue = filters[key] ? filters[key](value) : value;
        if (isDifferent(currentValues[key], saneValue)) {
          // $FlowFixMe
          currentValues[key] = saneValue;
          callback({ [key]: saneValue });
        }
      });
    }
  }
  return update;
}

export default getFilteredStreamStateUpdater;
