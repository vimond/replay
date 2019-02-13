// @flow
import * as React from 'react';
import { prefixClassNames } from '../../../common';
import type { TrackElementData, VideoStreamerRenderer } from './types';

const createTrackElement = ({ src, srclang, kind, label, onRef }: TrackElementData) => (
  // $FlowFixMe. ref doesn't accept HTMLTrackElement as subtype to HTMLElement.
  <track key={src + (label || '')} kind={kind} src={src} srcLang={srclang} label={label} ref={onRef} />
);

export const renderWithoutSource: VideoStreamerRenderer = (
  videoRef,
  videoElementEventHandlers,
  props,
  textTracks,
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
      {...videoElementEventHandlers}>
      {Array.isArray(textTracks) && textTracks.map(createTrackElement)}
    </video>
  );
};

export const renderWithSource: VideoStreamerRenderer = (
  videoRef,
  videoElementEventHandlers,
  props,
  textTracks,
  baseClassName,
  style
) => {
  const { className, classNamePrefix, source } = props;
  const classNames = prefixClassNames(classNamePrefix, baseClassName, className);
  const streamUrl = source && (typeof source === 'string' ? source : source.streamUrl);
  if (streamUrl) {
    return (
      <video
        autoPlay={true}
        controls={false}
        style={style}
        className={classNames}
        src={streamUrl}
        ref={videoRef}
        {...videoElementEventHandlers}>
        {Array.isArray(textTracks) && textTracks.map(createTrackElement)}
      </video>
    );
  } else {
    return <video className={classNames} ref={videoRef} src={''} controls={false} style={style} />;
  }
};
