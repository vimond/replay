// @flow
import Hls, { type HlsjsErrorData } from 'hls.js';
import { PlaybackError } from '../types';

const tech = 'hlsjs';
const ed = Hls.ErrorDetails;

const downloadErrors = [
  ed.MANIFEST_LOAD_ERROR,
  ed.MANIFEST_LOAD_TIMEOUT,
  ed.LEVEL_LOAD_ERROR,
  ed.LEVEL_LOAD_TIMEOUT,
  ed.AUDIO_TRACK_LOAD_ERROR,
  ed.AUDIO_TRACK_LOAD_TIMEOUT,
  ed.FRAG_LOAD_ERROR,
  ed.FRAG_LOOP_LOADING_ERROR,
  ed.FRAG_LOAD_TIMEOUT,
  ed.KEY_LOAD_ERROR,
  ed.KEY_LOAD_TIMEOUT
];
const decodeErrors = [
  ed.MANIFEST_PARSING_ERROR,
  ed.MANIFEST_INCOMPATIBLE_CODECS_ERROR,
  ed.FRAG_DECRYPT_ERROR,
  ed.BUFFER_ADD_CODEC_ERROR,
  ed.FRAG_PARSING_ERROR
];
/*const generalErrors = [
    t.BUFFER_APPEND_ERROR,
    t.BUFFER_APPENDING_ERROR,
    t.BUFFER_FULL_ERROR,
    t.INTERNAL_EXCEPTION,
    t.LEVEL_SWITCH_ERROR,
    t.REMUX_ALLOC_ERROR
];*/

function buildMessage(data: HlsjsErrorData) {
  const message = (data.type ? data.type + '/' : '') + (data.details || '');
  if (typeof data.reason === 'string') {
    return message + ': ' + data.reason;
  } else {
    return message;
  }
}

export function mapHlsjsError(isStarted: boolean, data: HlsjsErrorData) {
  const severity = data.fatal ? 'FATAL' : 'WARNING';
  const code =
    (data.details && (downloadErrors.indexOf(data.details) >= 0 && 'STREAM_ERROR_DOWNLOAD')) ||
    (decodeErrors.indexOf(data.details) >= 0 && 'STREAM_ERROR_DECODE') ||
    'STREAM_ERROR';
  return new PlaybackError(code, tech, buildMessage(data), severity, data);
}
