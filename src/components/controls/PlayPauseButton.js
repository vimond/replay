// @flow 
import * as React from 'react';
import ToggleButton from '../generic/ToggleButton';
import { defaultClassNamePrefix } from '../common';

type Props = {
    isPaused?: boolean,
    updateProperty?: ({ isPaused: boolean }) => void,
    label?: string,
    playingContent: React.Node,
    pausedContent: React.Node,
    classNamePrefix: string
};

const className = 'play-pause-button';

class PlayPauseButton extends React.Component<Props> {
    static defaultProps = {
        classNamePrefix: defaultClassNamePrefix
    };
    
    handleToggle = (value: boolean) => {
        if (this.props.updateProperty) {
			this.props.updateProperty({ isPaused: value });
        }
    };

    render() {
        const {
            isPaused,
            pausedContent,
            playingContent,
            label,
            classNamePrefix
        } = this.props;
        return <ToggleButton classNamePrefix={classNamePrefix} isOn={isPaused} className={className} label={label} onToggle={this.handleToggle} toggledOnContent={pausedContent} toggledOffContent={playingContent}/>
    }
    //TODO: Move definition of default class name prefix from generic components into this level.
}

export default PlayPauseButton;