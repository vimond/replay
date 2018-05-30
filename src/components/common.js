//@flow

export type CommonGenericProps = {
  classNamePrefix?: string,
  className?: string
};

export type CommonProps = {
  classNamePrefix?: string,
  label?: string
};

export type Id = string | number;

type Coordinates = { x: number, y: number, width: number, height: number };

export const defaultClassNamePrefix = 'v-player-';

export function prefixClassNames(prefix: ?string, ...names: Array<?string>): string {
  const sanitizedPrefix = prefix == null ? '' : prefix;
  return names
    .filter(n => n != null)
    .map(n => n && sanitizedPrefix + n)
    .join(' ');
}

export function getBoundingEventCoordinates(evt: any, element?: HTMLElement): Coordinates {
  // Difficult to code this with strict typing in a JS-optimal way. Sticking to any for the event.
  const domRect = (element || evt.currentTarget).getBoundingClientRect();
  let extractedEvent;
  if (evt.touches && evt.touches.length > 0) {
    extractedEvent = evt.touches[0];
  } else if (evt.changedTouches && evt.changedTouches.length > 0) {
    extractedEvent = evt.changedTouches[0];
  } else {
    extractedEvent = evt;
  }
  return {
    x: Math.max(0, Math.min(extractedEvent.pageX - domRect.left, domRect.width)),
    y: Math.max(0, Math.min(extractedEvent.pageY - domRect.top, domRect.height)),
    width: domRect.width,
    height: domRect.height
  };
}

export const isDifferent = (a: any, b: any) => {
  if (a === b) {
    return false;
  }
  if (Number.isNaN(a) && Number.isNaN(b)) {
    // Comparing NaN values are hard! https://ariya.io/2014/05/the-curious-case-of-javascript-nan
    return false;
  }
  return true;
};

export const isObject = (obj: ?{}) => obj != null && obj.constructor === {}.constructor;

export function deepClone(obj: ?{}): {} {
  if (obj == null) {
    return {};
  } else {
    const clone = {};
    const original = obj;
    Object.keys(obj).forEach(key => {
      if (isObject(original[key])) {
        clone[key] = deepClone(original[key]);
      } else {
        clone[key] = original[key];
      }
    });
    return clone;
  }
}

export function override(base: ?{}, overrides: ?{}): {} {
  const copy = deepClone(base);
  if (overrides) {
    const extension: {} = overrides; // Should be unnecessary!
    Object.getOwnPropertyNames((extension: {})).forEach(key => {
      if (isObject(extension[key])) {
        if (isObject(copy[key])) {
          copy[key] = override(copy[key], extension[key]);
        } else {
          copy[key] = deepClone(extension[key]);
        }
      } else {
        copy[key] = extension[key];
      }
    });
  }
  return copy;
}

export const formatTimeComponent = (
  integer: number,
  separator: string = '',
  emptyIfZero: boolean = false,
  pad: boolean = true
) => {
  return emptyIfZero && integer === 0 ? '' : integer < 10 && pad ? `0${integer}${separator}` : `${integer}${separator}`;
};

export const formatTime = (seconds: number, negativeMark: string = '-') => {
  let rounded = Math.round(seconds);
  let includedNegativeMark = '';
  if (seconds === true || isNaN(seconds) || seconds === Infinity) {
    rounded = 0;
  } else if (rounded < 0) {
    rounded = -rounded;
    includedNegativeMark = negativeMark;
  }
  const days = Math.floor(rounded / 86400);
  const daysInSeconds = days * 86400;
  const hours = Math.floor((rounded - daysInSeconds) / 3600);
  const hoursAndDaysInSeconds = daysInSeconds + hours * 3600;
  const minutes = Math.floor((rounded - hoursAndDaysInSeconds) / 60);
  const secs = rounded - hoursAndDaysInSeconds - minutes * 60;
  return (
    includedNegativeMark +
    formatTimeComponent(days, '.', true, false) +
    formatTimeComponent(hours, ':', days === 0) +
    formatTimeComponent(minutes, ':', false) +
    formatTimeComponent(secs)
  );
};

export const formatClockTime = (date: ?Date) => {
  const isValidDate = date instanceof Date && !isNaN(date.getTime());
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  if (isValidDate && date != null) {
    // Silly construct for flow null check.
    hours = isValidDate ? date.getHours() : 0;
    minutes = isValidDate ? date.getMinutes() : 0;
    seconds = isValidDate ? date.getSeconds() : 0;
  }
  return (
    formatTimeComponent(hours, ':', false) + formatTimeComponent(minutes, ':', false) + formatTimeComponent(seconds)
  );
};

/*
export const withProps = (Comp: React.ComponentType<{}>, injectedProps: any) => {
	return (props: any) => <Comp {...injectedProps} {...props} />; // Warning: props wins. Is that desiresd?
};
*/
