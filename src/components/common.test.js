import { prefixClassNames, getBoundingEventCoordinates, formatTime, formatClockTime } from "./common"

test('prefixClassNames() prefixes all class names passed and joins into one string.', () => {
    const prefix = 'myprefix-';
    const className1 = 'button';
    const className2 = 'ugly-theme';
    const className3 = 'toggled-on';
    const result = prefixClassNames(prefix, className1, className2, className3);
    expect(result).toBe('myprefix-button myprefix-ugly-theme myprefix-toggled-on');
});

test('prefixClassNames() doesn\'t include null or undefined if for prefix or class names with such values.', () => {
    const prefix1 = null;
    const prefix2 = 'myprefix-';
    const className1 = 'button';
    const className2 = undefined;
    const className3 = 'toggled-on';
    const result1 = prefixClassNames(prefix1, className1, className2, className3);
    expect(result1).toBe('button toggled-on');
    const result2 = prefixClassNames(prefix2, className1, className2, className3);
    expect(result2).toBe('myprefix-button myprefix-toggled-on');
})

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

test('getBoundingEventCoordinates() doesn\'t return coordinates outside element boundary.', () => {
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

test('formatTime() formats seconds with decimals into days, hours, (if > 0), and always minutes and seconds.', () =>  {
	expect(formatTime(34.56)).toBe('00:35');
	expect(formatTime(123.45)).toBe('02:03');
	expect(formatTime(4567.89)).toBe('01:16:08');
	expect(formatTime(-4567.89)).toBe('-01:16:08');
	expect(formatTime(87654.321)).toBe('1.00:20:54');
});

test('formatTime() formats 0 values and invalid numbers as 00:00.', () =>  {
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

const getUtcTime = (year, month, day, timeStr) => {
	const numbers = timeStr.split(':');
	const date = new Date(year, month + 1, day, parseInt(numbers[0],10), parseInt(numbers[1],10), parseInt(numbers[2],10));
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

test('override() merges two objects deeply, also when branches are unspecified in one of them.');

test('override() does not include base properties or branches when key is set to null in override.');

test('override() accepts null as parameters for both base and override.');

test('override() does not return mutated parts of base or override object, but a deeply cloned fresh object.');
