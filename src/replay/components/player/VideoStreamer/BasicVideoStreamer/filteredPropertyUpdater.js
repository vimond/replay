// @flow

import { type VideoStreamState } from '../types';
import { isDifferent } from '../../../common';
import type { VideoStreamStateKeys, VideoStreamStateValues } from '../types';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

const emptyFilters = {};

export type SanityFilter = <T: ?VideoStreamStateValues>(val: T) => T;

function getFilteredPropertyUpdater(callback: VideoStreamState => void, filters: { [VideoStreamStateKeys]: SanityFilter } = emptyFilters) {
  const currentValues: VideoStreamState = {};

  function notifyPropertyChange(property: VideoStreamState) {
    // $FlowFixMe Yet to understand how to get this type safe or let Flow see the type safety here.
    Object.entries(property).forEach(([key, value]) => {
      const saneValue = filters[key] ? filters[key](value) : value;
      if (isDifferent(currentValues[key], saneValue)) {
        // $FlowFixMe
        currentValues[key] = saneValue;
        // $FlowFixMe
        callback({ [key]: saneValue });
      }
    });
  }
  return { notifyPropertyChange };
}

export default getFilteredPropertyUpdater;