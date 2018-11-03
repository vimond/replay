// @flow
import * as React from 'react';
import { formatTime, formatClockTime, prefixClassNames } from '../../common';
import type { StreamStateKeysForObservation } from '../../player/PlayerController/ControllerContext';
import type { PlayMode } from '../../player/VideoStreamer/types';
import type { CommonProps } from '../../common';

type Props = CommonProps & {
  absoluteStartPosition: ?Date,
  playMode: ?PlayMode,
  duration: ?number,
  previewValue: ?number,
  isPointerInside?: boolean,
  isDragging?: ?boolean
};

const className = 'timeline-information';
const tooltipClassName = 'timeline-tooltip';
const tooltipVisibleClassName = 'timeline-tooltip-visible';

const getTimeDisplay = (playMode: ?PlayMode, absoluteStartPosition: ?Date, previewValue: ?number): string => {
  if (previewValue != null) {
    if (playMode === 'livedvr' && absoluteStartPosition instanceof Date && absoluteStartPosition.getTime() > 0) {
      return formatClockTime(new Date(absoluteStartPosition.getTime() + previewValue * 1000));
    } else {
      return formatTime(previewValue);
    }
  } else {
    return '';
  }
};

class TimelineInformation extends React.Component<Props> {
  static streamStateKeysForObservation: StreamStateKeysForObservation = [
    'absoluteStartPosition',
    'duration',
    'playMode'
  ];

  render() {
    const {
      absoluteStartPosition,
      duration,
      playMode,
      previewValue,
      isDragging,
      isPointerInside,
      classNamePrefix
    } = this.props;
    const timeDisplay = getTimeDisplay(playMode, absoluteStartPosition, previewValue);
    const left = (((previewValue || 0) / (duration || 1)) * 100).toFixed(2);
    const prefixedClassName = prefixClassNames(classNamePrefix, className);
    const prefixedTooltipClassNames = prefixClassNames(
      classNamePrefix,
      tooltipClassName,
      isDragging || isPointerInside ? tooltipVisibleClassName : null
    );
    return (
      <div className={prefixedClassName}>
        <div className={prefixedTooltipClassNames} style={{ left: `${left}%` }}>
          {timeDisplay}
        </div>
      </div>
    );
  }
}

export default TimelineInformation;
