// @flow
import * as React from 'react';
import ResizeObserver from 'resize-observer-polyfill';

// todo: Check use of native ResizeObserver when available!

export type ResponsiveRange = {
  className: string,
  width?: {
    min?: ?number,
    max?: ?number
  },
  height?: {
    min?: ?number,
    max?: ?number
  }
};

export type ResponsiveRanges = Array<ResponsiveRange>;

type RenderParameters = {
  onRef: (?HTMLElement) => void,
  responsiveClassNames: Array<string>
};

type Props = {
  configuration?: {
    responsivenessRules?: ?ResponsiveRanges
  },
  onRef?: (?HTMLElement) => void,
  render: RenderParameters => React.Node
};

type State = {
  responsiveClassNames: Array<string>
};

class ResponsiveClassNames extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      responsiveClassNames: []
    };
  }

  resizeObserver: ResizeObserver;

  onRef = (element: ?HTMLElement) => {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (
      element &&
      this.props.configuration &&
      Array.isArray(this.props.configuration.responsivenessRules) &&
      this.props.configuration.responsivenessRules.length > 0
    ) {
      if (!this.resizeObserver) {
        this.resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            this.onSizeChange(entry.contentRect);
            /*
            const {left, top, width, height} = entry.contentRect;

            console.log('Element:', entry.target);
            console.log(`Element's size: ${ width }px x ${ height }px`);
            console.log(`Element's paddings: ${ top }px ; ${ left }px`);
            */
          }
        });
        // console.log('ResizeObserver instantiated.', this.resizeObserver);
      }
      this.resizeObserver.observe(element);
    }
    if (this.props.onRef) {
      this.props.onRef(element);
    }
  };

  onSizeChange = (contentRect: { +width: number, +height: number }) => {
    const elementWidth = contentRect.width;
    const elementHeight = contentRect.height;
    if (this.props.configuration && Array.isArray(this.props.configuration.responsivenessRules)) {
      const responsiveClassNames = this.props.configuration.responsivenessRules
        .filter(({ width, height }) => {
          if (width && ((width.min && elementWidth <= width.min) || (width.max && elementWidth > width.max))) {
            return false;
          }
          if (height && ((height.min && elementHeight <= height.min) || (height.max && elementHeight > height.max))) {
            return false;
          }
          return true;
        })
        .map(range => range.className);
      this.setState({ responsiveClassNames });
    }
  };

  render() {
    return this.props.render({ onRef: this.onRef, responsiveClassNames: this.state.responsiveClassNames });
  }
}

export default ResponsiveClassNames;
