// @flow
import type { ErrorCode, Severity } from '../types';
import type { Shaka, ShakaError } from './types';
import { PlaybackError } from '../types';

const errorTechnology = 'shaka';

const STREAM_ERROR = 'STREAM_ERROR';
const STREAM_ERROR_DRM_CLIENT_UNAVAILABLE = 'STREAM_ERROR_DRM_CLIENT_UNAVAILABLE';
const STREAM_ERROR_DOWNLOAD = 'STREAM_ERROR_DOWNLOAD';
const STREAM_ERROR_DECODE = 'STREAM_ERROR_DECODE';
const STREAM_ERROR_DRM_OUTPUT_BLOCKED = 'STREAM_ERROR_DRM_OUTPUT_BLOCKED';

const errorFromCodeMappings = {
  '3016': function(shakaError) {
    if (shakaError.data && shakaError.data[0]) {
      if (shakaError.data[0] === 3) {
        return { classification: STREAM_ERROR_DECODE };
      }
    }
    return { classification: STREAM_ERROR };
  },
  '4012': { classification: STREAM_ERROR },
  '6001': { classification: STREAM_ERROR_DRM_CLIENT_UNAVAILABLE },
  '6002': { classification: STREAM_ERROR_DRM_CLIENT_UNAVAILABLE },
  '6003': { classification: STREAM_ERROR },
  '6007': { classification: STREAM_ERROR_DOWNLOAD },
  '6008': { classification: STREAM_ERROR_DOWNLOAD },
  '6013': { classification: STREAM_ERROR },
  '7000': { classification: '' },

  // Error codes starting with the following digits, are grouped together.
  '1': { classification: STREAM_ERROR_DOWNLOAD },
  '2': { classification: STREAM_ERROR_DECODE },
  '3': { classification: STREAM_ERROR_DECODE },
  '4': { classification: STREAM_ERROR_DECODE },
  '5': { classification: STREAM_ERROR_DECODE },
  '6': { classification: STREAM_ERROR_DECODE }
};

const defaultError = { classification: STREAM_ERROR };

function reverseLookup(numeric: string | number, mappings: { [string]: string }) {
  return Object.keys(mappings).filter(key => {
    return mappings[key] === parseInt(numeric, 10);
  })[0];
}

function buildMessage(shakaLib: Shaka, shakaError: ShakaError, classification: ErrorCode) {
  if (shakaError.code === 1001 && shakaError.data[1] != null) {
    return 'Shaka request failed with status ' + shakaError.data[1] + ' for URL ' + shakaError.data[0];
  }
  if (shakaError.code === 1002) {
    return 'Shaka request could not be performed for URL ' + shakaError.data[0];
  }
  if (shakaError.code === 1003) {
    return 'Shaka request timed out for URL ' + shakaError.data[0];
  }
  if (shakaError.message) {
    return shakaError.message;
  }
  if (classification === STREAM_ERROR_DRM_CLIENT_UNAVAILABLE) {
    return 'Playback of protected content appears to be disabled in the browser.';
  }
  if (classification === STREAM_ERROR_DRM_OUTPUT_BLOCKED) {
    return 'Playback of protected content appears to be disallowed, perhaps due to a non-secure or HDCP-less screen being connected.';
  }
  const code = reverseLookup(shakaError.code, shakaLib.util.Error.Code),
    category = reverseLookup(shakaError.category, shakaLib.util.Error.Category);
  const message = 'Shaka error ' + category + '/' + code + ' reported';

  if (shakaError.data[0]) {
    if (shakaError.data[0].message) {
      return message + ': ' + shakaError.data[0].message;
    } else {
      return message + '. See the sourceError property for more details.';
    }
  } else {
    return message + ' with no further details.';
  }
}

function getSeverity(isStarted: boolean, shakaError: ShakaError): Severity {
  if (shakaError.code === 1001 && shakaError.data) {
    if (shakaError.data[0] && /\.ttml|\.vtt|\.srt|subtitle/.test(shakaError.data[0])) {
      // Dirty check for subtitles requests failing. That's not fatal.
      return 'WARNING';
    } else if (shakaError.data[1] === 502) {
      return 'FATAL';
    }
  }
  if (shakaError.code === 4012) {
    return 'WARNING';
  }
  if ((isStarted && shakaError.code < 2000) || shakaError.category === 2) {
    return 'WARNING';
  }
  return 'FATAL';
}

function getFromDeclarativeMapping(shakaError) {
  if (shakaError.code) {
    const mapping = errorFromCodeMappings[shakaError.code] || errorFromCodeMappings[Math.floor(shakaError.code / 1000)];
    if (typeof mapping === 'function') {
      return mapping(shakaError) || defaultError;
    } else {
      return mapping || defaultError;
    }
  } else {
    return defaultError;
  }
}

function isEmeBlocked(userAgent: ?string, location: ?Location) {
  return (
    location &&
    location.protocol === 'http:' &&
    location.hostname.indexOf('localhost') !== 0 &&
    userAgent &&
    userAgent.indexOf('Edge') < 0 &&
    userAgent.indexOf('Chrome') > 0
  );
}

function mapShakaError(shakaLib: Shaka, isStarted: boolean, shakaError: ShakaError, userAgent?: string, location?: Location) {
  if (shakaError instanceof PlaybackError) {
    return shakaError;
  }
  const classification = getFromDeclarativeMapping(shakaError).classification;
  if ((shakaError.message || '').indexOf('MediaSource') >= 0) {
    return new PlaybackError(
      'STREAM_ERROR_TECHNOLOGY_UNSUPPORTED',
      'shaka',
      'This browser does not support playing MPEG-DASH streams with Shaka Player.',
      'FATAL',
      shakaError
    );
  } else if (classification) {
    if (classification === STREAM_ERROR_DRM_CLIENT_UNAVAILABLE && isEmeBlocked(userAgent, location)) {
      const message = 'DRM playback is blocked in Chrome. Likely reason: This page is not served with HTTPS.';
      return new PlaybackError(STREAM_ERROR, errorTechnology, message, getSeverity(isStarted, shakaError), shakaError);
    } else {
      return new PlaybackError(
        classification,
        errorTechnology,
        buildMessage(shakaLib, shakaError, classification),
        getSeverity(isStarted, shakaError),
        shakaError
      );
    }
  } else {
    return new PlaybackError(
      STREAM_ERROR,
      errorTechnology,
      'Unknown error reported from Shaka Player.',
      'WARNING',
      shakaError
    );
  }
}

export default mapShakaError;
