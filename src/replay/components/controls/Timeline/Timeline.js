// @flow
import * as React from 'react';
import { defaultClassNamePrefix } from '../../common';
import type { CommonProps } from '../../common';
import Slider from '../../generic/Slider/Slider';
import type { StreamStateKeysForObservation } from '../../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  position?: number,
  duration?: number,
  isSeeking?: boolean,
  children: React.Node,
  handleContent?: React.Node,
  trackContent?: React.Node,
  setProperties?: ({ position: number }) => void,
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
