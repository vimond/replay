// @flow 
import * as React from 'react';
import { type CommonGenericProps, prefixClassNames, defaultClassNamePrefix } from '../../common';
import type { VideoStreamProps } from "./common"

type Props = CommonGenericProps & VideoStreamProps;

const baseClassName = 'video-stream';

//TODO: Consider renaming into *VideoStreamer
class BasicVideoStream extends React.Component<Props> {
    static defaultProps = {
        classNamePrefix: defaultClassNamePrefix
    };

    play(): Promise<any> {
        return Promise.resolve();
    };
    pause(): Promise<any> {
        return Promise.resolve();
    };
    
    gotoLive() {
        
    }

	setPosition() {

	}
    
	// onReady!
	
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