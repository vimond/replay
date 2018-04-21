//@flow

export type CommonProps = {
    classNamePrefix: string,
    className?: string
};

export type Id = string|number;

type Coordinates = { x: number, y: number, width: number, height: number };

export const defaultClassNamePrefix = 'v-player-';

export function prefixClassNames(prefix: string, ...names:Array<?string>):string {
    const sanitizedPrefix = prefix == null ? '' : prefix;
    return names.filter(n => n != null).map(n => n && sanitizedPrefix + n).join(' ');
}

export function getBoundingEventCoordinates(evt: any, element?: HTMLElement): Coordinates { // Difficult to code this with strict typing in a JS-optimal way. Sticking to any for the event.
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

export const isObject = (obj: ?{}) => obj != null && obj.constructor === {}.constructor;

export function deepClone(obj: ?{}) : {} {
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