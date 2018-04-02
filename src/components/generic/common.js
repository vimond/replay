//@flow
import * as React from "react"

export type CommonProps = {
    classNamePrefix: string,
    className?: string
};

export type Id = string|number;

export function prefixClassNames(prefix: string, ...names:Array<?string>):string {
    const sanitizedPrefix = prefix == null ? '' : prefix;
    return names.filter(n => n != null).map(n => n && sanitizedPrefix + n).join(' ');
}

type Coordinates = { x: number, y: number, width: number, height: number };

//type CombinedEvent = SyntheticMouseEvent<HTMLDivElement> | SyntheticTouchEvent<HTMLDivElement> | MouseEvent | TouchEvent;

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