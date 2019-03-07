// @flow

import { PlaybackError, type ErrorCode } from '../types';

const videoErrorCodes = [
  '(unknown)', // 0
  'MEDIA_ERR_ABORTED', // 1
  'MEDIA_ERR_NETWORK', // 2
  'MEDIA_ERR_DECODE', // 3
  'MEDIA_ERR_SRC_NOT_SUPPORTED', // 4
  'MEDIA_ERR_ENCRYPTED' // 5 - Edge only?
];

const mapError = (videoElement: HTMLVideoElement): PlaybackError => {
  const isDesktopSafari = navigator.userAgent.match(/Mac OS X.*Safari/) && !navigator.userAgent.match(/(Chrome)/);
  const isIos = navigator.userAgent.match(/(iPad|iPhone|iPod)/i);

  let errorCode: ErrorCode = 'STREAM_ERROR';
  const sourceError = videoElement.error || new Error('Unknown video element error.');
  const sourceErrorCode = typeof sourceError.code === 'number' ? videoErrorCodes[sourceError.code] : videoErrorCodes[0];
  if (sourceErrorCode === 'MEDIA_ERR_DECODE' || sourceErrorCode === 'MEDIA_ERR_SRC_NOT_SUPPORTED') {
    if (isIos || isDesktopSafari) {
      // MEDIA_ERR_DECODE Observed on 404s on HLS fragments, and MEDIA_ERR_SRC_NOT_SUPPORTED observed on non-OK m3u8 requests.
      // Both should map to STREAM_ERROR_DOWNLOAD
      errorCode = 'STREAM_ERROR_DOWNLOAD';
    } else {
      // Otherwise, actual decode problem? "MEDIA_ERR_SRC_NOT_SUPPORTED" also could be considered a decode problem.
      errorCode = 'STREAM_ERROR_DECODE';
    }
  } else if (sourceErrorCode === 'MEDIA_ERR_NETWORK') {
    errorCode = 'STREAM_ERROR_DOWNLOAD';
  }
  return new PlaybackError(errorCode, 'html', `${sourceErrorCode}: ${sourceError.message || ''}`, 'FATAL', sourceError);
};

export default mapError;
