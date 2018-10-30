// @flow
import * as React from 'react';
import ToggleButton from '../../generic/ToggleButton/ToggleButton';
import { defaultClassNamePrefix } from '../../common';
import type { PlayMode } from '../../player/VideoStreamer/types';
import type { CommonProps } from '../../common';
import type { StreamStateKeysForObservation } from '../../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  isAtLiveEdge?: boolean,
  setProperties?: ({ isAtLiveEdge: true }) => void,
  playMode?: PlayMode,
  isAtLiveEdgeContent: React.Node,
  isNotAtLiveEdgeContent: React.Node
};

const className = 'goto-live-button';

class GotoLiveButton extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };

  static streamStateKeysForObservation: StreamStateKeysForObservation = ['isAtLiveEdge', 'playMode'];

  handleToggle = (value: boolean) => {
    if (value && this.props.setProperties) {
      this.props.setProperties({ isAtLiveEdge: true });
    }
  };

  render() {
    const { playMode, isAtLiveEdge, isAtLiveEdgeContent, isNotAtLiveEdgeContent, label, classNamePrefix } = this.props;
    return playMode === 'livedvr' ? (
      <ToggleButton
        classNamePrefix={classNamePrefix}
        isOn={isAtLiveEdge}
        className={className}
        label={label}
        onToggle={this.handleToggle}
        toggledOnContent={isAtLiveEdgeContent}
        toggledOffContent={isNotAtLiveEdgeContent}
      />
    ) : null;
  }
}

export default GotoLiveButton;
