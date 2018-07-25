import mapError from './errorMapper';
import { PlaybackError } from '../types';

test('mapError() wraps the error in a PlaybackError', () => {
  const error = new Error('Something went wrong.');
  error.code = 313;
  const playbackError = mapError({ error });
  expect(playbackError).toBeInstanceOf(PlaybackError);
});
