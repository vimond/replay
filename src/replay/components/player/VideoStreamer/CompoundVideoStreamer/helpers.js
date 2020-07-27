// @flow

import type { StreamResource } from './CompoundVideoStreamer';

export type StreamType = {
  name: string,
  label: string,
  contentTypes: Array<string>,
  urlMatch: RegExp,
  urlNotMatch?: RegExp
};

export const hlsContentTypes = ['application/x-mpegurl', 'vnd.apple.mpegurl'];

export const streamTypes: Array<StreamType> = [
  {
    name: 'progressive',
    label: 'Progressive (MP4, WebM)',
    contentTypes: ['video/mp4', 'video/webm'],
    urlMatch: /(\.webm|\.mp4)/,
    urlNotMatch: /(\/Manifest|\.mpd|\.m3u)/
  },
  {
    name: 'dash',
    label: 'MPEG DASH',
    contentTypes: ['application/dash+xml'],
    urlMatch: /\.mpd/
  },
  {
    name: 'hls',
    label: 'Apple HLS',
    contentTypes: hlsContentTypes,
    urlMatch: /\.m3u/
  },
  {
    name: 'smooth',
    label: 'Smooth stream',
    contentTypes: ['application/vnd.ms-sstr+xml'],
    urlMatch: /\/Manifest/,
    urlNotMatch: /(\.mpd|\.m3u|\.mp4)/
  }
];

export const isSafari = (userAgent: string) =>
  userAgent.indexOf('Safari') > 0 && userAgent.indexOf('Chrome') < 0 && userAgent.indexOf('Firefox') < 0;

export const isLegacyMicrosoft = (userAgent: string) => userAgent.match(/(Edge\/|rv:11\.0)/);

export const isChromiumEdgeOnWindows = (userAgent: string) => userAgent.match(/(Windows NT(.*?)Edg\/)/);

// TODO: For symmetry, there should be an method matching all Widevine-compatible browsers.

export const isResourceFairPlay = (resource: StreamResource): boolean => {
  const contentType = resource.contentType;
  const drmType = resource.drmType ? resource.drmType : null;
  return !!(
    contentType &&
    hlsContentTypes.indexOf(contentType.toLowerCase()) >= 0 &&
    drmType &&
    drmType.match(/(fairplay|com\.apple\.fps)/i)
  );
};

export const isResourcePlayReady = (resource: StreamResource): boolean => {
  return !!(resource.drmType && resource.drmType.match(/playready/i));
};

export const isResourceWidevine = (resource: StreamResource): boolean => {
  return !!(resource.drmType && resource.drmType.match(/widevine/i));
};

export const isResourcePlayReadyOrWidevine = (resource: StreamResource): boolean =>
  isResourcePlayReady(resource) || isResourceWidevine(resource);

export const detectStreamType = (streamUrl: string, contentType: ?string): StreamType =>
  streamTypes.filter(type => {
    if (contentType) {
      return type.contentTypes.indexOf(contentType.toLowerCase()) >= 0;
    } else {
      const urlNotMatch = type.urlNotMatch;
      if (urlNotMatch) {
        return type.urlMatch.test(streamUrl) && !urlNotMatch.test(streamUrl);
      } else {
        return type.urlMatch.test(streamUrl);
      }
    }
  })[0] || streamTypes[0];
