// @flow
import * as React from 'react';
import { formatTime, formatClockTime, prefixClassNames, defaultClassNamePrefix } from '../../common';
import type { StreamStateKeysForObservation } from '../../player/PlayerController/ControllerContext';
import type { PlayMode } from '../../player/VideoStreamer/types';
import type { CommonProps } from '../../common';

type Props = CommonProps & {
  /** ⇘︎ For previewing live clock time positions, this should contain the date/time corresponding to the start of the timeline.. */
  absoluteStartPosition: ?Date,
  /** ⇘︎ Used for selecting relative position or clock time display. */
  playMode: ?PlayMode,
  /** ⇘︎ Used for computing the tooltip position. */
  duration: ?number,
  /** The relative preview position, passed automatically from a Timeline parent. */
  previewValue: ?number,
  /** The Timeline parent manages mouse pointer state, and passes to this component. If true, the tooltip is displayed. */
  isPointerInside?: boolean,
  /** Passed from the Timeline parent. When dragging, it is set to true, and the tooltip displays. */
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
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };
  
  
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
