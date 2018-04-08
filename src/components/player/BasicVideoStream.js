// @flow 
import * as React from 'react';
import { type CommonProps, prefixClassNames, defaultClassNamePrefix } from '../common';

type Props = CommonProps & {
    source?: {
        streamUrl: string,
        licenseUrl?: string,
        startPosition?: number
    }
};

const baseClassName = 'video-stream';

class BasicVideoStream extends React.Component<Props> {
    static defaultProps = {
        classNamePrefix: defaultClassNamePrefix
    }

    render() {
        const {
            className,
            classNamePrefix,
            source
        }: Props = this.props;
        const classNames = prefixClassNames(classNamePrefix, baseClassName, className);
        if (source && source.streamUrl) {
            return <video className={classNames} src={source.streamUrl}/>;
        } else {
            return <video className={classNames} />;
        }
        
    }
}

export default BasicVideoStream;