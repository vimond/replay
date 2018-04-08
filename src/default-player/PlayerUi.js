// @flow
import * as React from 'react';
import { type CommonProps, prefixClassNames, defaultClassNamePrefix } from '../components/common';
import ControlsBar from '../components/player/ControlsBar';
import PlayerHost from '../components/player/PlayerHost';
import Poster from '../components/player/Poster';
import BasicVideoStream from '../components/player/BasicVideoStream';
import BufferingIndicator from '../components/player/BufferingIndicator';
import PlayPauseButton from '../components/controls/PlayPauseButton';
import SkipButton from '../components/controls/SkipButton';
import Timeline from '../components/controls/Timeline';
//import GotoLiveButton from '../components/controls/GotoLiveButton';
import TimeDisplay from '../components/controls/TimeDisplay';
import Volume from '../components/controls/Volume';
//import AudioSelector from '../components/controls/AudioSelector';
//import SubtitlesSelector from '../components/controls/SubtitlesSelector';
//import QualitySelector from '../components/controls/QualitySelector';
import FullscreenButton from '../components/controls/FullscreenButton';

type Props = CommonProps & {
    graphics: any,
    labels: any,
    classNamePrefix: any
};

class PlayerUi extends React.Component<Props> {
    static defaultProps = {
        classNamePrefix: defaultClassNamePrefix
    }

    render() {
        return (
            <PlayerHost>
                <BasicVideoStream/>
                <ControlsBar>
                    <PlayPauseButton/>
                    <SkipButton/>
                    <Timeline/>
                    <TimeDisplay/>
                    <Volume/>
                    <FullscreenButton/>
                </ControlsBar>
                <Poster/>
                <BufferingIndicator/>
            </PlayerHost>
        );
    }
}

export default PlayerUi;