// @flow
import * as React from 'react';
import { defaultClassNamePrefix } from '../../common';
import type { CommonProps } from '../../common';
import Slider from '../../generic/Slider/Slider';
import type { StreamStateKeysForObservation } from '../../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  /** ⇘︎ The current playback position in seconds (with decimals). A value between 0 and duration. */
  position?: number,
  /** ⇘︎ The stream's duration or seekable range in seconds (with decimals). */
  duration?: number,
  /** ⇘︎ True if a seeking operation is ongoing. This prop is used by the component to avoid glitching while dragging. */
  isSeeking?: boolean,
  /** Elements that will display on top of the timeline slider track, but below the timeline handle. */
  children: React.Node,
  /** Can be set for custom graphics or content in the slider handle. */
  handleContent?: React.Node,
  /** Can be set for custom graphics or content representing the slider track. */
  trackContent?: React.Node,
  /** ⇗ If the volume slider handle position is changed, this callback is invoked with { position: newPosition } */
  setProperties?: ({ position: number }) => void,
  /** If set to false, glitches after dragging completes will occur, while the stream reports a position before seeking is performed. When true glitches are prevented by activating a timer for a small time after dragging has completed.*/
  reduceDragGlitch?: boolean
};

type State = {
  isDragging: boolean
};

const className = 'timeline';
const trackClassName = 'timeline-track';
const handleClassName = 'timeline-handle';

class Timeline extends React.Component<Props, State> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix,
    reduceDragGlitch: true
  };

  static streamStateKeysForObservation: StreamStateKeysForObservation = ['position', 'duration', 'isSeeking'];

  timeoutId: ?TimeoutID;

  constructor(props: Props) {
    super(props);
    this.state = { isDragging: false };
  }

  handleSliderChange = (position: number) => {
    if (this.props.setProperties) {
      this.props.setProperties({ position });
    }
  };

  handleDrag = () => {
    this.setState({ isDragging: true });
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.setState({ isDragging: false });
      this.timeoutId = null;
    }, 800);
  };

  componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  render() {
    const {
      position,
      duration,
      isSeeking,
      label,
      classNamePrefix,
      children,
      handleContent,
      trackContent,
      reduceDragGlitch
    } = this.props;
    return (
      <Slider
        label={label}
        value={position}
        maxValue={duration}
        isUpdateBlocked={isSeeking || this.state.isDragging}
        handleContent={handleContent}
        trackContent={trackContent}
        onValueChange={this.handleSliderChange}
        onDrag={reduceDragGlitch ? this.handleDrag : undefined}
        classNamePrefix={classNamePrefix}
        className={className}
        trackClassName={trackClassName}
        handleClassName={handleClassName}>
        {children}
      </Slider>
    );
  }
}

export default Timeline;
