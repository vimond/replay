import mapError from './errorMapper';
import { PlaybackError } from '../types';

const defaultUserAgent = navigator.userAgent;
Object.defineProperty(navigator, 'userAgent', { enumerable: true, writable: true });
navigator.userAgent = defaultUserAgent;

test('mapError() wraps the error in a PlaybackError', () => {
  const error = new Error('Something went wrong.');
  error.code = 313;
  const playbackError = mapError({ error });
  expect(playbackError).toBeInstanceOf(PlaybackError);
  expect(playbackError.code).toBe('STREAM_ERROR');
});

test('mapError() classifies the error as STREAM_ERROR_DECODE if media error code MEDIA_ERR_DECODE or MEDIA_ERR_SRC_NOT_SUPPORTED is reported', () => {
  navigator.userAgent = defaultUserAgent;
  const error = new Error('Something went wrong.');
  error.code = 3;
  const playbackError = mapError({ error });
  const error2 = new Error('Something went wrong.');
  error2.code = 4;
  const playbackError2 = mapError({ error: error2 });
  expect(playbackError.code).toBe('STREAM_ERROR_DECODE');
  expect(playbackError2.code).toBe('STREAM_ERROR_DECODE');
});

test('mapError() classifies the error as STREAM_ERROR_DOWNLOAD if media error code MEDIA_ERR_DECODE or MEDIA_ERR_SRC_NOT_SUPPORTED is reported in Safari.', () => {
  navigator.userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15';
  const error = new Error('Something went wrong.');
  error.code = 3;
  const playbackError = mapError({ error });
  const error2 = new Error('Something went wrong.');
  error2.code = 4;
  const playbackError2 = mapError({ error: error2 });
  expect(playbackError.code).toBe('STREAM_ERROR_DOWNLOAD');
  expect(playbackError2.code).toBe('STREAM_ERROR_DOWNLOAD');
});

test('mapError() classifies the error as STREAM_ERROR_DOWNLOAD if media error code MEDIA_ERR_NETWORK is reported', () => {
  navigator.userAgent = defaultUserAgent;
  const error = new Error('Something went wrong.');
  error.code = 2;
  const playbackError = mapError({ error });
  expect(playbackError.code).toBe('STREAM_ERROR_DOWNLOAD');
});
