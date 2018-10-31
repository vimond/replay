// @flow
import * as React from 'react';
import { prefixClassNames } from '../../../common';
import type { VideoStreamerRenderer } from './types';

export const renderWithoutSource: VideoStreamerRenderer = (
  videoRef,
  videoElementEventHandlers,
  props,
  baseClassName,
  style
) => {
  const { className, classNamePrefix } = props;
  const classNames = prefixClassNames(classNamePrefix, baseClassName, className);
  return (
    <video
      autoPlay={true}
      controls={false}
      style={style}
      className={classNames}
      ref={videoRef}
      {...videoElementEventHandlers}
    />
  );
};

export const renderWithSource: VideoStreamerRenderer = (
  videoRef,
  videoElementEventHandlers,
  props,
  baseClassName,
  style
) => {
  const { className, classNamePrefix, source } = props;
  const classNames = prefixClassNames(classNamePrefix, baseClassName, className);
  const streamUrl = source && (typeof source === 'string' && source.length > 0 ? source : source.streamUrl);
  if (streamUrl) {
    return (
      <video
        autoPlay={true}
        controls={false}
        style={style}
        className={classNames}
        src={streamUrl}
        ref={videoRef}
        {...videoElementEventHandlers}
      />
    );
  } else {
    return (
      <video className={classNames} ref={videoRef} src={''} controls={false} style={style} />
    );
  }
};
