// @flow
import * as React from 'react';

type RenderParameters = {
  isUserActive: boolean,
  nudge: () => void,
  handleMouseMove: (evt: MouseEvent) => void,
  handleTouchStart: (evt: TouchEvent) => void,
  handleTouchEnd: (evt: TouchEvent) => void
};

export type InteractionDetectorConfiguration = {
  inactivityDelay: number
};

type Props = {
  configuration?: {
    interactionDetector?: InteractionDetectorConfiguration
  },
  render: RenderParameters => React.Node
};

type State = {
  isUserActive: boolean
};

type InteractionState = {
  isMouseMoved: boolean,
  isTouched: boolean,
  isTouching: boolean,
  isEntered: boolean,
  clientX: number,
  clientY: number
};

const getDelaySeconds = configuration => configuration && configuration.interactionDetector && configuration.interactionDetector.inactivityDelay != null ? configuration.interactionDetector.inactivityDelay : 2;

class InteractionDetector extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isUserActive: true };
  }

  delaySeconds: number;
  intervalId: IntervalID;
  inactivityTimeoutId: TimeoutID;
  flags: InteractionState = {
    isMouseMoved: true,
    isTouched: false,
    isTouching: false,
    isEntered: false,
    clientX: -1,
    clientY: -1
  };

  componentDidMount() {
    const delaySeconds = getDelaySeconds(this.props.configuration);
    if (delaySeconds >= 0) {
      // Negative values deactivate
      this.intervalId = setInterval(this.updateActivity, 250); // This interval is not the inactivity delay.
    }
  }
  
  componentDidUpdate(prevProps: Props, prevState: State) {
    const delaySeconds = getDelaySeconds(this.props.configuration);
    if (delaySeconds !== getDelaySeconds(prevProps.configuration)) {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      if (delaySeconds >= 0) {
        // Negative values deactivate
        this.intervalId = setInterval(this.updateActivity, 250); // This interval is not the inactivity delay.
      } else {
        this.setState({ isUserActive: true });
      }
    }
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.inactivityTimeoutId) {
      clearTimeout(this.inactivityTimeoutId);
    }
  }

  handleMouseMove = (evt: MouseEvent) => {
    if (evt.clientX !== this.flags.clientX || evt.clientY !== this.flags.clientY) {
      this.flags.isMouseMoved = true;
      this.flags.clientX = evt.clientX;
      this.flags.clientY = evt.clientY;
    }
  };

  handleTouchStart = () => {
    this.flags.isTouched = true;
    this.flags.isTouching = true;
  };

  handleTouchEnd = () => {
    this.flags.isTouching = false;
  };

  nudge = () => {
    this.flags.isMouseMoved = true;
  };

  setInactive = () => {
    if (!this.flags.isMouseMoved) {
      this.setState({ isUserActive: false });
    }
  };

  updateActivity = () => {
    //debugger;
    if (this.flags.isMouseMoved || this.flags.isTouched || this.flags.isTouching) {
      this.flags.isTouched = false;
      this.flags.isMouseMoved = false;
      if (!this.state.isUserActive) {
        this.setState({ isUserActive: true });
      }
      clearTimeout(this.inactivityTimeoutId);
      this.inactivityTimeoutId = setTimeout(this.setInactive, getDelaySeconds(this.props.configuration) * 1000);
    }
  };

  render() {
    const { isUserActive } = this.state;
    const { render } = this.props;
    const { handleMouseMove, handleTouchStart, handleTouchEnd, nudge } = this;
    return render({ isUserActive, handleMouseMove, handleTouchStart, handleTouchEnd, nudge });
  }
}

export default InteractionDetector;
