// @flow
import * as React from 'react';
import type { ControlNames } from '../../default-player/types';

type Props = {
  children: React.Node,
  configuration: ?Array<ControlNames>
};

const extractChildName = child => {
  const name = child && child.type && (child.type.displayName || child.type.name);
  if (name) {
    const startIndex = name.indexOf('Connected') === 0 ? 9 : 0;
    return name.charAt(startIndex).toLowerCase() + name.substr(startIndex + 1);
  }
};

class RenderIfEnabled extends React.Component<Props> {
  render() {
    if (this.props.configuration) {
      return React.Children.map(this.props.children, child => {
        const childName = extractChildName(child);
        if (!childName || (this.props.configuration && this.props.configuration.indexOf(childName) >= 0)) {
          return child;
        }
      });
    } else {
      return this.props.children;
    }
  }
}

export default RenderIfEnabled;
