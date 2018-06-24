// @flow
import * as React from 'react';
import { type CommonGenericProps, prefixClassNames, getBoundingEventCoordinates } from '../common';

type Props = CommonGenericProps & {
  value: number,
  maxValue: number,
  isUpdateBlocked?: boolean,
  isVertical?: boolean,
  children?: React.Node,
  handleContent?: React.Node,
  handleClassName?: string,
  trackContent?: React.Node,
  trackClassName?: string,
  label?: string,
  onValueChange?: number => void,
  onDrag?: number => void
};

type State = {
  dragValue?: number,
  isDragging?: boolean
};

const baseClassName = 'slider';
const isDraggingClassName = 'dragging';
const baseTrackClassName = 'slider-track';
const baseHandleClassName = 'slider-handle';
const zeroStyle = '0%';
const horizontalProp = 'left';
const verticalProp = 'bottom';

function toPercentString(value: number, maxValue: number): string {
  const attempt = value / maxValue;
  if (maxValue === Infinity || value === Infinity || maxValue === 0 || isNaN(attempt) || attempt === 0) {
    return zeroStyle;
  } else {
    return `${(Math.min(1, attempt) * 100).toFixed(3)}%`;
  }
}

/*

The styling of the slider needs to follow some rules in order to get sensible responses from user interactions:

* The draggable or clickable area will be the size of the track element (remember how margin, borders, padding, box-sizing, etc. affects the size).
* The handle positioning (between 0 and 100 percent from left or bottom) should align with the track size and placement.
* The styling needs to take into account the size of the handle itself. The component will not subtract the size of the component in its positioning and value calculations.
* The handle should ideally be shifted half its width to the left for horizontal sliders, or half its height down for vertical sliders. It is the center coordinate that should count.

 */

class Slider extends React.Component<Props, State> {
  static defaultProps = {
    value: 0,
    maxValue: 1
  };

  renderedHandle: ?HTMLDivElement;
  renderedTrack: ?HTMLDivElement;
  isTouchSupported: boolean;

  constructor(props: Props) {
    super(props);
    this.isTouchSupported = 'ontouchend' in window;
    this.state = {};
  }

  updateValueFromCoordinates = (
    evt: SyntheticMouseEvent<HTMLDivElement> | MouseEvent | TouchEvent,
    isDragging?: boolean,
    isEnded?: boolean
  ) => {
    if (this.renderedTrack) {
      const clickCoordinates = getBoundingEventCoordinates(evt, this.renderedTrack);
      if (this.props.isVertical) {
        const relativeVerticalValue = (clickCoordinates.height - clickCoordinates.y) / clickCoordinates.height;
        this.updateValue(relativeVerticalValue, isDragging, isEnded);
      } else {
        const relativeHorizontalValue = clickCoordinates.x / clickCoordinates.width;
        this.updateValue(relativeHorizontalValue, isDragging, isEnded);
      }
    }
  };

  updateValue = (relativeValue: number, isDragging?: boolean, isEnded?: boolean) => {
    const value = relativeValue * this.props.maxValue;
    if (this.state.isDragging) {
      this.setState({
        dragValue: value
      });
      if (this.props.onDrag) {
        this.props.onDrag(value);
      }
    }
    if (this.props.onValueChange && (isEnded || !(this.state.isDragging || isDragging))) {
      this.props.onValueChange(value);
    }
  };

  handleHandleOrTrackClick = (evt: SyntheticMouseEvent<HTMLDivElement>) => {
    this.updateValueFromCoordinates(evt);
  };

  handleHandleStartDrag = (evt: SyntheticMouseEvent<HTMLDivElement>) => {
    if (!this.state.isDragging) {
      this.setState({ isDragging: true });
      this.updateValueFromCoordinates(evt, true);
      // We are OK with no position updates yet.
      if (this.isTouchSupported) {
        document.addEventListener('touchmove', this.handleHandleDrag.bind(this));
        document.addEventListener('touchend', this.handleHandleEndDrag.bind(this));
        document.addEventListener('touchcancel', this.handleHandleEndDrag.bind(this));
      } else {
        document.addEventListener('mousemove', this.handleHandleDrag.bind(this));
        document.addEventListener('mouseup', this.handleHandleEndDrag.bind(this));
        document.addEventListener('mouseleave', this.handleHandleEndDrag.bind(this));
      }
    }
  };

  handleHandleDrag = (evt: SyntheticMouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
    if (this.state.isDragging) {
      this.updateValueFromCoordinates(evt);
    }
  };

  handleHandleEndDrag = (evt: SyntheticMouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
    if (this.state.isDragging) {
      this.updateValueFromCoordinates(evt, true, true);
    }
    if (this.isTouchSupported) {
      document.removeEventListener('touchmove', this.handleHandleDrag.bind(this));
      document.removeEventListener('touchend', this.handleHandleEndDrag.bind(this));
      document.removeEventListener('touchcancel', this.handleHandleEndDrag.bind(this));
    } else {
      document.removeEventListener('mousemove', this.handleHandleDrag.bind(this));
      document.removeEventListener('mouseup', this.handleHandleEndDrag.bind(this));
      document.removeEventListener('mouseleave', this.handleHandleEndDrag.bind(this));
    }
    this.setState({ isDragging: false });
  };

  setRenderedHandle = (handle: ?HTMLDivElement) => {
    this.renderedHandle = handle;
  };

  setRenderedTrack = (track: ?HTMLDivElement) => {
    this.renderedTrack = track;
  };

  render() {
    const {
      children,
      handleContent,
      trackContent,
      classNamePrefix,
      className,
      handleClassName,
      trackClassName,
      label,
      isVertical,
      value,
      maxValue,
      isUpdateBlocked
    } = this.props;
    const { dragValue, isDragging } = this.state;
    const displayValue = (isDragging || isUpdateBlocked) && dragValue != null ? dragValue : value;
    const sliderClassNames = isDragging
      ? prefixClassNames(classNamePrefix, baseClassName, className, isDraggingClassName)
      : prefixClassNames(classNamePrefix, baseClassName, className);
    const handleClassNames = prefixClassNames(classNamePrefix, baseHandleClassName, handleClassName);
    const trackClassNames = prefixClassNames(classNamePrefix, baseTrackClassName, trackClassName);
    return (
      <div
        onClick={this.handleHandleOrTrackClick}
        onMouseDown={this.handleHandleStartDrag}
        onMouseUp={this.handleHandleEndDrag}
        onMouseMove={this.handleHandleDrag}
        title={label}
        className={sliderClassNames}>
        <div className={trackClassNames} ref={this.setRenderedTrack}>
          {trackContent}
        </div>
        {children}
        <div
          className={handleClassNames}
          style={{ [isVertical ? verticalProp : horizontalProp]: toPercentString(displayValue, maxValue) }}
          ref={this.setRenderedHandle}>
          {handleContent}
        </div>
      </div>
    );
  }
}

export default Slider;

/*

Consider moving all events to track or slider itself. Or moving track on top of children!

 */

/* Assumptions

Clickable area = track length OR is it slider length?
If track length - should we assume that it aligns with possible handle min/max positions?

*/
