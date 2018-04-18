// @flow 
import * as React from 'react';
import ToggleButton from '../generic/ToggleButton';

type Props = {
    isPaused: boolean,
    play?: () => Promise<void>,
    pause?: () => Promise<void>,
    setIsPaused?: (boolean) => Promise<void>,
    label?: string,
    playingContent: React.Node,
    pausedContent: React.Node
};

const className = 'play-pause-button';

class PlayPauseButton extends React.Component<Props> {
    
    handleToggle(value: boolean) {
        if (this.props.setIsPaused) {
			this.props.setIsPaused(value).catch(err => {});
        } else {
			if (value) {
				this.props.pause && this.props.pause().catch(err => {});
			} else {
				this.props.play && this.props.play().catch(err => {});
			}
        }
    }

    render() {
        const {
            isPaused,
            pausedContent,
            playingContent,
            label
        } = this.props;
        return <ToggleButton isOn={isPaused} className={className} label={label} onToggle={this.handleToggle} toggledOnContent={pausedContent} toggledOffContent={playingContent}/>
    }
    //TODO: Move definition of default class name prefix from generic components into this level.
}

export default PlayPauseButton;