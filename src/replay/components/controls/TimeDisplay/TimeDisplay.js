// @flow

import * as React from 'react';
import type { CommonProps } from '../../common';
import { defaultClassNamePrefix, formatClockTime, formatTime, prefixClassNames } from '../../common';
import type { PlayMode } from '../../player/VideoStreamer/types';
import type { ObservingControlStaticProps } from '../../player/PlayerController/ControllerContext';

export type LiveDisplayMode = 'clock-time' | 'live-offset';

type Props = CommonProps & {
  /** ⇘︎ The relative playback position, used for on demand position and timeshift offset display. */
  position?: number,
  /** ⇘︎ The duration of the stream, used for on demand position and timeshift offset display. */
  duration?: number,
  /** ⇘︎ The clock time, used for live streams and DVR streams when liveDisplayMode is set to 'live-offset'. */
  absolutePosition?: ?Date,
  /** ⇘︎ Play mode is used to decide what times to display. */
  playMode?: PlayMode,
  /** When set to 'live-offset', DVR times will be displayed as offsets from the live edge. Default is 'clock-time'. */
  liveDisplayMode?: LiveDisplayMode,
  negativeMark?: string,
  positionLabel?: string,
  durationLabel?: string,
  clockTimeLabel?: string
};

type TimeDisplayType = React.StatelessFunctionalComponent<Props> & ObservingControlStaticProps;

const className = 'time-display';
const positionClassName = 'time-display-position';
const durationClassName = 'time-display-duration';
const clockTimeClassName = 'time-display-clock-time';
const noDurationClassName = 'time-display-no-duration';

const isReasonableDateTime = date => date instanceof Date && !isNaN(date.getTime()) && date.getTime() > 1514761200000;

const formatAndLimitTime = (time: ?number, negativeMark?: string, zeroAndBelow: boolean = false) =>
  formatTime(time == null ? 0 : Math[zeroAndBelow ? 'min' : 'max'](0, time), negativeMark);

const TimeDisplay: TimeDisplayType = ({
  position,
  duration,
  absolutePosition,
  playMode,
  liveDisplayMode = 'clock-time',
  negativeMark,
  label,
  positionLabel,
  durationLabel,
  clockTimeLabel,
  classNamePrefix = defaultClassNamePrefix
}: Props) => {
  if (playMode === 'ondemand') {
    return (
      <div className={prefixClassNames(classNamePrefix, className)} title={label}>
        <span className={prefixClassNames(classNamePrefix, positionClassName)} title={positionLabel}>
          {formatAndLimitTime(position, negativeMark)}
        </span>
        <span className={prefixClassNames(classNamePrefix, durationClassName)} title={durationLabel}>
          {formatAndLimitTime(duration, negativeMark)}
        </span>
      </div>
    );
  } else {
    if ((liveDisplayMode === 'live-offset' && playMode === 'livedvr') || !isReasonableDateTime(absolutePosition)) {
      return (
        <div className={prefixClassNames(classNamePrefix, className)} title={label}>
          <span className={prefixClassNames(classNamePrefix, positionClassName)} title={positionLabel}>
            {formatAndLimitTime((position || duration || 0) - (duration || 0), negativeMark, true)}
          </span>
          {playMode === 'livedvr' && (
            <span className={prefixClassNames(classNamePrefix, durationClassName)} title={durationLabel}>
              {formatAndLimitTime(duration, negativeMark)}
            </span>
          )}
        </div>
      );
    } else {
      return (
        <div className={prefixClassNames(classNamePrefix, className, noDurationClassName)} title={label}>
          <span className={prefixClassNames(classNamePrefix, clockTimeClassName)} title={positionLabel}>
            {formatClockTime(absolutePosition)}
          </span>
        </div>
      );
    }
  }
};

TimeDisplay.streamStateKeysForObservation = ['position', 'duration', 'absolutePosition', 'playMode'];

export default TimeDisplay;
