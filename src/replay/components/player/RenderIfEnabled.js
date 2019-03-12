// @flow
import * as React from 'react';
import type { ControlNames } from '../../default-player/types';

type Props = {
  children: React.Node,
  configuration: ?Array<ControlNames>
};

const alreadyWarnedNames = [];

const analyzeChild = child => {
  const type = child && child.type;
  let displayName = type && child.type.displayName;
  const name = type && child.type.name;
  let fullName = name;
  if (name === 'ConnectedControl') {
    fullName = child.type.controlWithoutDisplayName || name;
  }
  if (!displayName && (!name || alreadyWarnedNames.indexOf(name) === -1)) {
    // eslint-disable-next-line no-console
    console.warn(
      '<RenderIfEnabled/> depends on child components having the displayName static property set. The component %s, has no ' +
        'displayName property set. If no displayName is added to %s, the control might not render in production builds.',
      fullName || '[no name found]',
      name || '[no name found]'
    );
    if (name) {
      alreadyWarnedNames.push(name);
    }
  }
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
        if (process.env.NODE_ENV === 'development') {
          analyzeChild(child);
        }
        const childName = extractChildName(child);
        if (!childName || (this.props.configuration && this.props.configuration.indexOf(childName) >= 0)) {
          return child;
        }
      });
    } else if (process.env.NODE_ENV === 'development') {
      React.Children.forEach(this.props.children, analyzeChild);
      return this.props.children;
    } else {
      return this.props.children;
    }
  }
}

export default RenderIfEnabled;
