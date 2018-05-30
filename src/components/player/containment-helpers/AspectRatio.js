// @flow
import * as React from 'react';

type Props = {
  aspectRatio?: {
    horizontal: number,
    vertical: number
  },
  render: () => React.Node,
  className?: string
};

const AspectRatio = ({ aspectRatio = { horizontal: 16, vertical: 9 }, render, className }: Props) => {
  const outerStyle = { position: 'relative' },
    beforeStyle = {
      display: 'block',
      width: '100%',
      paddingTop: ((aspectRatio.vertical * 100) / aspectRatio.horizontal).toFixed(2) + '%'
    };
  return (
    <div className={className} style={outerStyle}>
      <div style={beforeStyle} />
      {render()}
    </div>
  );
};

export default AspectRatio;
