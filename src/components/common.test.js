import { prefixClassNames, getBoundingEventCoordinates } from "./common"

test('prefixClassNames prefixes all class names passed and joins into one string.', () => {
    const prefix = 'myprefix-';
    const className1 = 'button';
    const className2 = 'ugly-theme';
    const className3 = 'toggled-on';
    const result = prefixClassNames(prefix, className1, className2, className3);
    expect(result).toBe('myprefix-button myprefix-ugly-theme myprefix-toggled-on');
});

test('prefixClassNames doesn\'t include null or undefined if for prefix or class names with such values.', () => {
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

test('getBoundingEventCoordinates returns coordinates relative to target element.', () => {
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

test('getBoundingEventCoordinates returns coordinates relative to explicitly passed element.', () => {
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

test('getBoundingEventCoordinates doesn\'t return coordinates outside element boundary.', () => {
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