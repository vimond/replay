//@flow
import * as React from "react"

export type CommonProps = {
    classNamePrefix: string,
    className?: string
};

export type Id = string|number;

export function prefixClassNames(prefix: string, ...names:Array<?string>):string {
    const sanitizedPrefix = prefix == null ? '' : prefix;
    return names.map(n => n && sanitizedPrefix + n).join(' ');
}