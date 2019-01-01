// @flow
import { PlaybackError } from '../types';
import type { FairPlayRequestFormat, PlaybackSource, VideoStreamerConfiguration } from '../types';
import getBasicSourceChangeHandler from '../BasicVideoStreamer/sourceChangeHandler';
import normalizeSource from '../common/sourceNormalizer';

declare class Object {
  static entries<TKey, TValue>({ [key: TKey]: TValue }): [TKey, TValue][];
}

type LicenseAcquisitionDetails = {
  licenseUrl: string,
  licenseRequestHeaders?: { [string]: string },
  fairPlayCertificateUrl: string,
  requestFormat: FairPlayRequestFormat,
  contentId: ?(string | number),
  contentIdExtractMatch: ?(RegExp | string)
};

const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const technology = 'html';

class RequestError extends Error {
  constructor(status: number, url: string, message: string, method: 'GET' | 'POST') {
    super(message);
    this.status = status;
    this.url = url;
    this.method = method;
  }
  status: number;
  url: string;
  method: 'GET' | 'POST';
}

function getRequestError(xhr, url, message, method = 'GET') {
  return new PlaybackError(
    'STREAM_ERROR_DOWNLOAD',
    technology,
    message,
    'FATAL',
    new RequestError(xhr.status, url, message, method)
  );
}

function stringToArray(string: string) {
  const buffer = new ArrayBuffer(string.length * 2); // 2 bytes for each char
  const array = new Uint16Array(buffer);
  for (let i = 0, strLen = string.length; i < strLen; i++) {
    array[i] = string.charCodeAt(i);
  }
  return array;
}

function arrayToString(array) {
  return String.fromCharCode.apply(null, new Uint16Array(array.buffer));
}

function base64DecodeUint8Array(input) {
  const raw = window.atob(input);
  const rawLength = raw.length;
  const array = new Uint8Array(new ArrayBuffer(rawLength));
  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

function base64EncodeUint8Array(input) {
  let output = '';
  let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  let i = 0;

  while (i < input.length) {
    chr1 = input[i++];
    chr2 = i < input.length ? input[i++] : Number.NaN;
    chr3 = i < input.length ? input[i++] : Number.NaN;

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
  }
  return output;
}

function extractContentId(initData, contentIdExtractMatch: ?(string | RegExp)) {
  const url = arrayToString(initData);
  const regex = contentIdExtractMatch
    ? typeof contentIdExtractMatch === 'string'
      ? new RegExp(contentIdExtractMatch)
      : contentIdExtractMatch
    : /([0-9]+)$/;
  if (regex.exec) {
    const matches = regex.exec(url);
    return matches && matches[0];
  }
}

function concatInitDataIdAndCertificate(
  isBase64: boolean,
  initData: Uint8Array,
  contentId: Uint16Array | string | number,
  cert: Uint8Array
) {
  if (typeof contentId === 'string') {
    contentId = stringToArray(contentId);
  } else if (typeof contentId === 'number') {
    contentId = stringToArray('' + contentId);
  }
  // layout is [initData][4 byte: idLength][idLength byte: contentId][4 byte:certLength][certLength byte: cert]
  let offset = 0;
  const buffer = new ArrayBuffer(initData.byteLength + 4 + contentId.byteLength + 4 + cert.byteLength);
  const dataView = new DataView(buffer);

  const initDataArray = new Uint8Array(buffer, offset, initData.byteLength);
  initDataArray.set(initData);
  offset += initData.byteLength;

  dataView.setUint32(offset, contentId.byteLength, true);
  offset += 4;

  const idArray = isBase64
    ? new Uint8Array(buffer, offset, contentId.byteLength)
    : new Uint16Array(buffer, offset, contentId.length);
  idArray.set(contentId);
  offset += idArray.byteLength;

  dataView.setUint32(offset, cert.byteLength, true);
  offset += 4;

  const certArray = new Uint8Array(buffer, offset, cert.byteLength);
  certArray.set(cert);

  return new Uint8Array(buffer, 0, buffer.byteLength);
}

function formatRequestPayloadAsPostParameters(spc, contentId?: ?(string | number)) {
  if (contentId) {
    return (
      'contentId=' + encodeURIComponent(contentId.toString()) + 'spc=' + encodeURIComponent(base64EncodeUint8Array(spc))
    );
  } else {
    return 'spc=' + encodeURIComponent(base64EncodeUint8Array(spc));
  }
}

const getFairPlayLicenseAcquirer = (
  videoElement: HTMLVideoElement,
  acquisitionDetails: LicenseAcquisitionDetails,
  onError: ?(PlaybackError) => void,
  log?: (string, any) => void
) => {
  if (!(acquisitionDetails && 'WebKitMediaKeys' in window)) {
    return;
  }
  const keySystem = 'com.apple.fps.1_0';
  const { contentIdExtractMatch, fairPlayCertificateUrl } = acquisitionDetails;
  const licenseRequestHeaders =
    (acquisitionDetails.licenseRequestHeaders &&
      Object.entries(acquisitionDetails.licenseRequestHeaders).map(([name, value]) => ({
        name,
        value
      }))) ||
    [];
  const isBinary = acquisitionDetails.requestFormat === 'binary';
  const isBase64 = acquisitionDetails.requestFormat === 'base64';
  let certificate = null;
  let { contentId, licenseUrl } = acquisitionDetails;

  function onNeedKey(event: { initData: Uint8Array }) {
    const initData = event.initData;
    const idString = isBinary
      ? arrayToString(initData).replace(/^.*:\/\//, '')
      : contentId || extractContentId(initData, contentIdExtractMatch);

    if (isBinary) {
      log && log('Content ID extracted from initData.', contentId);
    } else if (!contentId) {
      log && log('Content ID extracted from initData.', contentId);
    }

    // $FlowFixMe
    if (!videoElement.webkitKeys) {
      // $FlowFixMe
      videoElement.webkitSetMediaKeys(new window.WebKitMediaKeys(keySystem));
    }

    // $FlowFixMe
    if (!videoElement.webkitKeys) {
      handleError(
        new PlaybackError('STREAM_ERROR_DRM_CLIENT_UNAVAILABLE', technology, 'Safari EME API not available.')
      );
      return;
    }

    if (!licenseUrl) {
      const url = arrayToString(initData).substring(1);
      licenseUrl = url.substring(url.indexOf('/', url.indexOf('://') + 3));
    }
    if (idString) {
      if (certificate) {
        if (!createKeySession(idString, concatInitDataIdAndCertificate(isBase64, initData, idString, certificate))) {
          handleError(
            new PlaybackError('STREAM_ERROR_DRM_CLIENT_UNAVAILABLE', technology, 'Could not create key session.')
          );
          return;
        }
      } else {
        // load certificate
        const request = new XMLHttpRequest();
        request.responseType = 'arraybuffer';
        request.addEventListener('load', () => {
          if (request.status && request.status < 400) {
            certificate = new Uint8Array(request.response);
            if (createKeySession(idString, concatInitDataIdAndCertificate(isBase64, initData, idString, certificate))) {
              handleError(
                new PlaybackError('STREAM_ERROR_DRM_CLIENT_UNAVAILABLE', technology, 'Could not create key session.')
              );
              return;
            }
          } else {
            handleError(getRequestError(request, fairPlayCertificateUrl, 'Download of FairPlay certificate failed.'));
            return;
          }
        });
        request.addEventListener(
          'error',
          () =>
            handleError(
              getRequestError(request, fairPlayCertificateUrl, 'Download of FairPlay certificate was blocked.')
            ),
          false
        );
        request.addEventListener(
          'timeout',
          () =>
            handleError(
              getRequestError(request, fairPlayCertificateUrl, 'Download of FairPlay certificate timed out.')
            ),
          false
        );
        request.open('GET', fairPlayCertificateUrl, true);
        request.send();
      }
    } else {
      handleError(
        new PlaybackError(
          'STREAM_ERROR',
          technology,
          'No content ID available. Cannot complete FairPlay license acquisition.',
          'FATAL'
        )
      );
    }
  }

  function createKeySession(contentId, initData) {
    // $FlowFixMe Safari specific APIs.
    const keySession = videoElement.webkitKeys.createSession('video/mp4', initData);
    if (!keySession) {
      return false;
    }
    keySession.contentId = contentId;
    // keySession.licenseURL = licenseUrl;
    keySession.addEventListener('webkitkeymessage', licenseRequestReady, false);
    keySession.addEventListener('webkitkeyadded', onkeyadded, false);
    keySession.addEventListener('webkitkeyerror', onkeyerror, false);
  }

  function licenseRequestReady(event) {
    log && log('Key session ready for license request.');
    const session = event.target;
    const message = event.message;
    const request = new XMLHttpRequest();
    request.responseType = isBinary ? 'arraybuffer' : 'text';

    request.addEventListener('load', () => {
      if (request.status && request.status < 400) {
        if (isBinary) {
          const arrayBuffer = request.response;
          session.update(new Uint8Array(arrayBuffer));
        } else {
          // response can be of the form: '\n<ckc>base64encoded</ckc>\n'
          // so trim the excess:
          let keyText = request.responseText.trim();
          if (keyText.substr(0, 5) === '<ckc>' && keyText.substr(-6) === '</ckc>') {
            keyText = keyText.slice(5, -6);
          }
          session.update(base64DecodeUint8Array(keyText));
        }
      } else {
        handleError(getRequestError(request, licenseUrl, 'Acquisition of FairPlay license failed.', 'POST'));
      }
    });
    request.addEventListener(
      'error',
      () =>
        handleError(getRequestError(request, fairPlayCertificateUrl, 'Acquisition of FairPlay license was blocked.')),
      false
    );
    request.addEventListener(
      'timeout',
      () => handleError(getRequestError(request, fairPlayCertificateUrl, 'Acquisition of FairPlay license timed out.')),
      false
    );

    request.open('POST', licenseUrl, true);
    licenseRequestHeaders.forEach(function({ name, value }) {
      request.setRequestHeader(name, value);
    });
    if (isBinary) {
      request.setRequestHeader('Content-type', 'application/octet-stream');
      request.send(message);
    } else if (isBase64) {
      request.send(base64EncodeUint8Array(message));
    } else {
      request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      request.send(formatRequestPayloadAsPostParameters(message, contentId));
    }
  }

  function onkeyadded(event) {
    log && log('Decryption key added', event);
  }

  function onkeyerror(event: any) {
    const code = (event.target && event.target.error && event.target.error.code) || 0;
    if (code === 6 || code === 4) {
      const message =
        'FairPlay blocked the playback because of non-secure output path, e.g. external VGA screen connected.';
      handleError(
        new PlaybackError(
          'STREAM_ERROR_DRM_OUTPUT_BLOCKED',
          technology,
          message,
          'FATAL',
          event.target && event.target.error
        )
      );
    } else {
      handleError(
        new PlaybackError(
          'STREAM_ERROR_DECODE',
          technology,
          'Could not decrypt FairPlay stream.',
          'FATAL',
          event.target && event.target.error
        )
      );
    }
    cleanup();
  }

  // $FlowFixMe Safari EME specific stuff.
  videoElement.addEventListener('webkitneedkey', onNeedKey, false);

  function cleanup() {
    // $FlowFixMe Safari EME specific stuff.
    videoElement.removeEventListener('webkitneedkey', onNeedKey, false);
  }

  function handleError(playbackError) {
    if (onError) {
      onError(playbackError);
    }
    cleanup();
  }

  return {
    cleanup
  };
};

function hydrateLicenseAquisitionDetails(source: ?PlaybackSource, configuration: ?VideoStreamerConfiguration) {
  const normalizedSource = normalizeSource(source);
  if (normalizedSource && normalizedSource.licenseUrl) {
    const licenseUrl = normalizedSource.licenseUrl;
    const config =
      (configuration && configuration.licenseAcquisition && configuration.licenseAcquisition.fairPlay) || {};
    const licenseAcquisitionDetails = normalizedSource.licenseAcquisitionDetails || {};

    const fairPlayCertificateUrl = licenseAcquisitionDetails.fairPlayCertificateUrl || config.serviceCertificateUrl;
    const contentIdExtractMatch = licenseAcquisitionDetails.contentIdExtractMatch || config.contentIdExtractMatch;

    const requestFormat = licenseAcquisitionDetails.fairPlayRequestFormat || config.requestFormat || 'formdata';
    const licenseRequestHeaders = licenseAcquisitionDetails.licenseRequestHeaders;
    const contentId = licenseAcquisitionDetails.contentId;

    if (!fairPlayCertificateUrl) {
      return null;
    }
    return {
      licenseUrl,
      licenseRequestHeaders,
      fairPlayCertificateUrl,
      requestFormat,
      contentId,
      contentIdExtractMatch
    };
  } else {
    return null;
  }
}

function getSourceChangeHandler(videoElement: HTMLVideoElement) {
  const handleBasicSourceChange = getBasicSourceChangeHandler(videoElement);
  let previousSession;

  const handleSourceChange = <
    P: {
      source?: ?PlaybackSource,
      configuration?: ?VideoStreamerConfiguration,
      onPlaybackError?: PlaybackError => void
    }
  >(
    nextProps: P,
    prevProps: ?P
  ) => {
    if (previousSession) {
      previousSession.cleanup();
    }
    const acquisitionDetails = hydrateLicenseAquisitionDetails(nextProps.source, nextProps.configuration);
    if (acquisitionDetails) {
      previousSession = getFairPlayLicenseAcquirer(videoElement, acquisitionDetails, nextProps.onPlaybackError);
    }
    return handleBasicSourceChange(nextProps, prevProps);
  };
  return handleSourceChange;
}

export default getSourceChangeHandler;
