// @flow

import { PlaybackError } from '../types';

const videoErrorCodes = [
  '(unknown)', // 0
  'MEDIA_ERR_ABORTED', // 1
  'MEDIA_ERR_NETWORK', // 2
  'MEDIA_ERR_DECODE', // 3
  'MEDIA_ERR_SRC_NOT_SUPPORTED', // 4
  'MEDIA_ERR_ENCRYPTED'
]; // 5 - Edge only?

// TODO! TODO! TODO!

const mapError = (videoElement: HTMLVideoElement): PlaybackError => {
  const errorCode = 'STREAM_ERROR';
  const sourceError = videoElement.error || new Error('Unknown video element error.');
  const sourceErrorCode = typeof sourceError.code === 'number' ? videoErrorCodes[sourceError.code] : videoErrorCodes[0];
  return new PlaybackError(errorCode, 'html', `${sourceErrorCode}: ${sourceError.message || ''}`, 'FATAL', sourceError);
};

export default mapError;
