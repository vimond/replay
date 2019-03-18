import * as React from 'react';
import { formatTime } from '../../../components/common';

const styleHidden = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  color: 'white',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: '0.5em 1em',
  margin: 0,
  fontFamily: 'sans-serif',
  fontSize: '2em',
  transition: 'visibility 0.5s, opacity 0.5s, color 0.5s',
  visibility: 'hidden',
  opacity: 0
};

const styleVisible = {
  ...styleHidden,
  visibility: 'visible',
  opacity: 1
};

const TitleOverlay = ({ duration, title, isUserActive, isPaused }) => (
  <h4 style={isUserActive || isPaused ? styleVisible : styleHidden}>
    {title}
    {duration ? ` (${formatTime(duration)})` : ''}
  </h4>
);

export default TitleOverlay;
