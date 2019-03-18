import * as React from 'react';
import { formatTime } from '../../../components/common';

const styleHidden = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  fontFamily: 'sans-serif',
  transition: 'visibility 0.5s, opacity 0.5s, color 0.5s',
  visibility: 'hidden',
  opacity: 0
};

const styleVisible = {
  ...styleHidden,
  visibility: 'visible',
  opacity: 1
};

const TitleOverlay = (duration, title, isVisible) => (
  <h4 style={isVisible ? styleVisible : styleHidden}>
    {title}
    {duration ? ` (${formatTime(duration)})` : ''}
  </h4>
);

export default TitleOverlay;
