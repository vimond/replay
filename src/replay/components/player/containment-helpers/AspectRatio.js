// @flow
import * as React from 'react';
import { defaultClassNamePrefix, prefixClassNames } from '../../common';
import memoize from 'memoize-one';

type Props = {
  aspectRatio?: {
    horizontal: number,
    vertical: number
  },
  classNamePrefix?: string,
  aspectFixClassName?: ?string,
  render: () => React.Node,
  rootClassName?: string
};

const outerStyle = { position: 'relative', maxHeight: '100vh' };

const helperStyle = {
  display: 'block',
  width: '100%',
  paddingTop: '56.25%',
  pointerEvents: 'none'
};

const getHelperStyle = memoize(aspectRatio =>
  aspectRatio
    ? { ...helperStyle, paddingTop: ((aspectRatio.vertical * 100) / aspectRatio.horizontal).toFixed(2) + '%' }
    : helperStyle
);

const AspectRatio = ({
  aspectRatio,
  render,
  rootClassName = '',
  aspectFixClassName,
  classNamePrefix = defaultClassNamePrefix
}: Props) => {
  if (aspectFixClassName) {
    return (
      <div className={`${rootClassName} ${prefixClassNames(classNamePrefix, aspectFixClassName)}`}>{render()}</div>
    );
  } else {
    const beforeStyle = getHelperStyle(aspectRatio);
    return (
      <div className={rootClassName} style={outerStyle}>
        <div style={beforeStyle} />
        {render()}
      </div>
    );
  }
};

export default AspectRatio;
