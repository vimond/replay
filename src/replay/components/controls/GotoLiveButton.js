// @flow
import * as React from 'react';
import ToggleButton from '../generic/ToggleButton';
import { defaultClassNamePrefix } from '../common';
import type { PlayMode } from '../player/VideoStreamer/types';
import type { CommonProps } from '../common';
import type { StreamStateKeysForObservation } from '../player/player-controller/ControllerContext';

type Props = CommonProps & {
  isAtLivePosition?: boolean,
  gotoLive?: () => void,
  playMode?: PlayMode,
  isAtLivePositionContent: React.Node,
  isNotAtLivePositionContent: React.Node
};

const className = 'goto-live-button';

class GotoLiveButton extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };

  static streamStateKeysForObservation: StreamStateKeysForObservation = ['isAtLivePosition', 'playMode'];

  handleToggle = (value: boolean) => {
    if (value && this.props.gotoLive) {
      this.props.gotoLive();
    }
  };

  render() {
    const {
      playMode,
      isAtLivePosition,
      isAtLivePositionContent,
      isNotAtLivePositionContent,
      label,
      classNamePrefix
    } = this.props;
    return playMode === 'livedvr' ? (
      <ToggleButton
        classNamePrefix={classNamePrefix}
        isOn={isAtLivePosition}
        className={className}
        label={label}
        onToggle={this.handleToggle}
        toggledOnContent={isAtLivePositionContent}
        toggledOffContent={isNotAtLivePositionContent}
      />
    ) : null;
  }
}

export default GotoLiveButton;
