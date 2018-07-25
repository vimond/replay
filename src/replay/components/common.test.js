import {
  prefixClassNames,
  getBoundingEventCoordinates,
  formatTime,
  formatClockTime,
  isDifferent,
  hydrateClassNames,
  isShallowEqual
} from './common';

test('prefixClassNames() prefixes all class names passed and joins into one string.', () => {
  const prefix = 'myprefix-';
  const className1 = 'button';
  const className2 = 'ugly-theme';
  const className3 = 'toggled-on';
  const result = prefixClassNames(prefix, className1, className2, className3);
  expect(result).toBe('myprefix-button myprefix-ugly-theme myprefix-toggled-on');
});

test("prefixClassNames() doesn't include null or undefined if for prefix or class names with such values.", () => {
  const prefix1 = null;
  const prefix2 = 'myprefix-';
  const className1 = 'button';
  const className2 = undefined;
  const className3 = 'toggled-on';
  const result1 = prefixClassNames(prefix1, className1, className2, className3);
  expect(result1).toBe('button toggled-on');
  const result2 = prefixClassNames(prefix2, className1, className2, className3);
  expect(result2).toBe('myprefix-button myprefix-toggled-on');
});

test('hydrateClassNames() returns unprefixed class names from the classes object when the latter is specified.', () => {
  const classNamePrefix = 'myprefix-';
  const className1 = 'button';
  const className2 = 'ugly-theme';
  const className3 = 'toggled-on';
  const classes = {
    a: 'button-123',
    b: 'nice-button-123'
  };
  const selectClasses = cls => [cls.a, cls.b];
  const selectClasses2 = cls => cls.b;
  const result = hydrateClassNames({
    classes,
    selectClasses,
    classNamePrefix,
    classNames: [className1, className2, className3]
  });
  expect(result).toBe('button-123 nice-button-123');
  const result2 = hydrateClassNames({
    classes,
    selectClasses: selectClasses2,
    classNamePrefix,
    classNames: [className1, className2, className3]
  });
  expect(result2).toBe('nice-button-123');
});

test('hydrateClassNames() prefixes all class names passed and joins into one string if classes is null.', () => {
  const classNamePrefix = 'myprefix-';
  const className1 = 'button';
  const className2 = 'ugly-theme';
  const className3 = 'toggled-on';
  const selectClasses = cls => [cls.a, cls.b];
  const result = hydrateClassNames({
    classes: null,
    selectClasses,
    classNamePrefix,
    classNames: [className1, className2, className3]
  });
  expect(result).toBe('myprefix-button myprefix-ugly-theme myprefix-toggled-on');
});

test('getBoundingEventCoordinates() returns coordinates relative to target element.', () => {
  const mockEventElement = {
    getBoundingClientRect: function() {
      return {
        top: 13,
        left: 313,
        width: 400,
        height: 40
      };
    }
  };
  const mockEvent = {
    currentTarget: mockEventElement,
    pageX: 456,
    pageY: 23
  };
  expect(getBoundingEventCoordinates(mockEvent)).toMatchObject({ x: 143, y: 10, width: 400, height: 40 });
});

test('getBoundingEventCoordinates() returns coordinates relative to explicitly passed element.', () => {
  const mockElement = {
    getBoundingClientRect: function() {
      return {
        top: 321,
        left: 123,
        width: 300,
        height: 400
      };
    }
  };
  const mockEvent = {
    pageX: 234,
    pageY: 345
  };
  expect(getBoundingEventCoordinates(mockEvent, mockElement)).toMatchObject({ x: 111, y: 24, width: 300, height: 400 });
});

test("getBoundingEventCoordinates() doesn't return coordinates outside element boundary.", () => {
  const mockEventElement = {
    getBoundingClientRect: function() {
      return {
        top: 13,
        left: 313,
        width: 400,
        height: 40
      };
    }
  };
  const mockEvent1 = {
    currentTarget: mockEventElement,
    pageX: 456,
    pageY: 789
  };
  const mockEvent2 = {
    currentTarget: mockEventElement,
    pageX: 0,
    pageY: 0
  };
  const mockEvent3 = {
    currentTarget: mockEventElement,
    pageX: 1234,
    pageY: 5678
  };
  expect(getBoundingEventCoordinates(mockEvent1)).toMatchObject({ x: 143, y: 40, width: 400, height: 40 });
  expect(getBoundingEventCoordinates(mockEvent2)).toMatchObject({ x: 0, y: 0, width: 400, height: 40 });
  expect(getBoundingEventCoordinates(mockEvent3)).toMatchObject({ x: 400, y: 40, width: 400, height: 40 });
});

test('formatTime() formats seconds with decimals into days, hours, (if > 0), and always minutes and seconds.', () => {
  expect(formatTime(34.56)).toBe('00:35');
  expect(formatTime(123.45)).toBe('02:03');
  expect(formatTime(4567.89)).toBe('01:16:08');
  expect(formatTime(-4567.89)).toBe('-01:16:08');
  expect(formatTime(87654.321)).toBe('1.00:20:54');
});

test('formatTime() formats 0 values and invalid numbers as 00:00.', () => {
  const zz = '00:00';
  expect(formatTime(NaN)).toBe(zz);
  expect(formatTime(undefined)).toBe(zz);
  expect(formatTime(null)).toBe(zz);
  expect(formatTime('Midnight')).toBe(zz);
  expect(formatTime('')).toBe(zz);
  expect(formatTime(false)).toBe(zz);
  expect(formatTime(true)).toBe(zz);
  expect(formatTime(0)).toBe(zz);
});

const pad = v => (v < 10 ? '0' : '') + v;

export const getUtcTime = (year, month, day, timeStr) => {
  const numbers = timeStr.split(':');
  const date = new Date(
    year,
    month + 1,
    day,
    parseInt(numbers[0], 10),
    parseInt(numbers[1], 10),
    parseInt(numbers[2], 10)
  );
  return pad(date.getUTCHours()) + ':' + pad(date.getUTCMinutes()) + ':' + pad(date.getUTCSeconds());
};

test('formatClockTime() formats dates with hours, minutes, and seconds in local time.', () => {
  // Time zones spoil these tests.
  expect(getUtcTime(2018, 4, 23, formatClockTime(new Date('2018-04-23T20:56:12.123Z')))).toEqual('20:56:12');
  expect(getUtcTime(2018, 4, 22, formatClockTime(new Date('2018-04-22T23:59:59.567Z')))).toEqual('23:59:59');
});

test('formatClockTime() formats invalid dates as 00:00:00.', () => {
  const zzz = '00:00:00';
  expect(formatClockTime(new Date(NaN))).toBe(zzz);
  expect(getUtcTime(1970, 1, 1, formatClockTime(new Date(0)))).toBe(zzz);
  expect(formatClockTime(new Date(Infinity))).toBe(zzz);
  expect(formatClockTime(null)).toBe(zzz);
  expect(formatClockTime('Midnight')).toBe(zzz);
  expect(formatClockTime(123)).toBe(zzz);
});

test('isDifferent() returns true with different strings, booleans, or numbers compared.', () => {
  expect(isDifferent('The DVR feature enables timeshifting.', 'The DVR feature enables time shifting.')).toBe(true);
  expect(isDifferent('', ' ')).toBe(true);
  expect(isDifferent(true, false)).toBe(true);
  expect(isDifferent(false, true)).toBe(true);
  expect(isDifferent(23, Infinity)).toBe(true);
  expect(isDifferent(23, 24)).toBe(true);
});
test('isDifferent() returns true with different functions, object instances or arrays passed.', () => {
  expect(isDifferent({}, {})).toBe(true);
  expect(isDifferent({ yes: 'no' }, { yes: 'no' })).toBe(true);
  expect(isDifferent({ yes: 'no' }, { no: 'yes' })).toBe(true);
  expect(isDifferent(() => {}, () => {})).toBe(true);
  expect(
    isDifferent(
      function hello(arg) {
        return arg;
      },
      function hello(arg) {
        return arg;
      }
    )
  ).toBe(true);
  expect(isDifferent([], [])).toBe(true);
  expect(isDifferent([1, 2, 3], [1, 2, 3])).toBe(true);
  expect(isDifferent([1, 2, 3], [1, 4, 7])).toBe(true);
});

test('isDifferent() returns true with different types passed.', () => {
  expect(isDifferent('false', false)).toBe(true);
  expect(isDifferent('undefined', undefined)).toBe(true);
  expect(isDifferent(0, false)).toBe(true);
});

test('isDifferent() returns false with the same values of strings, booleans, or numbers compared.', () => {
  expect(isDifferent('The DVR feature enables timeshifting.', 'The DVR feature enables timeshifting.')).toBe(false);
  expect(isDifferent('', '')).toBe(false);
  expect(isDifferent(false, false)).toBe(false);
  expect(isDifferent(true, true)).toBe(false);
  expect(isDifferent(Infinity, Infinity)).toBe(false);
  expect(isDifferent(0, 0)).toBe(false);
  expect(isDifferent(13, 13)).toBe(false);
});

test('isDifferent() returns false with the same object instances compared.', () => {
  const obj1 = {};
  const obj2 = { yes: 'no' };
  const arr = [1, 2, 3, 'yes', obj1, obj2];
  expect(isDifferent(obj1, obj1)).toBe(false);
  expect(isDifferent(obj2, obj2)).toBe(false);
  expect(isDifferent(arr, arr)).toBe(false);
});
test('isDifferent() returns false with two NaNs, nulls, or undefined passed.', () => {
  expect(isDifferent(NaN, NaN)).toBe(false);
  expect(isDifferent(null, null)).toBe(false);
  expect(isDifferent(undefined, undefined)).toBe(false);
});

test('isShallowEqual() returns true for two objects having the same property set with the same values.', () => {
  const a = {
    c: 'n',
    d: 13,
    e: NaN
  };
  const b = {
    c: 'n',
    d: 13,
    e: NaN
  };
  expect(isShallowEqual(a, b)).toBe(true);
});

test('isShallowEqual() returns true for two references to the same object.', () => {
  const a = {
    c: 'n',
    d: 13,
    e: NaN
  };
  const b = a;
  expect(isShallowEqual(a, b)).toBe(true);
});

test('isShallowEqual() returns true for two equal values of primitive types.', () => {
  const a = 'hello';
  const b = 'hello';
  expect(isShallowEqual(a, b)).toBe(true);
  const c = 313;
  const d = 313;
  expect(isShallowEqual(c, d)).toBe(true);
  const e = null;
  const f = null;
  expect(isShallowEqual(e, f)).toBe(true);
});

test('isShallowEqual() returns false for two different values of primitive types.', () => {
  const a = 'hello';
  const b = 'world';
  expect(isShallowEqual(a, b)).toBe(false);
  const c = 313;
  const d = 626;
  expect(isShallowEqual(c, d)).toBe(false);
  const e = null;
  const f = new Date();
  expect(isShallowEqual(e, f)).toBe(false);
});

test('isShallowEqual() returns false for two objects not having the same property sets.', () => {
  const a = {
    c: 'n',
    d: 13,
    e: NaN
  };
  const b = {
    c: 'n',
    d: 13,
    e: NaN,
    f: {}
  };
  expect(isShallowEqual(a, b)).toBe(false);
});

test('isShallowEqual() returns false for two objects not having the same property values.', () => {
  const a = {
    c: 'n',
    d: 13,
    e: NaN
  };
  const b = {
    c: 'n',
    d: 14,
    e: NaN
  };
  expect(isShallowEqual(a, b)).toBe(false);
});

// TODO: Write tests.
test('override() merges two objects deeply, also when branches are unspecified in one of them.');

test('override() does not include base properties or branches when key is set to null in override.');

test('override() accepts null as parameters for both base and override.');

test('override() does not return mutated parts of base or override object, but a deeply cloned fresh object.');
