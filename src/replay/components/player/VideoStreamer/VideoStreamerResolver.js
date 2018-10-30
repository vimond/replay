// @flow
import * as React from 'react';

// TODO: React Suspense!
import BasicVideoStreamer from './BasicVideoStreamer/BasicVideoStreamer';
import HlsjsVideoStreamer from './HlsjsVideoStreamer/HlsjsVideoStreamer';
import ShakaVideoStreamer from './ShakaVideoStreamer/ShakaVideoStreamer';
import type { PlaybackSource } from './types';
import HtmlVideoStreamer from './HtmlVideoStreamer/HtmlVideoStreamer';

type StreamType = {
  name: string,
  label: string,
  contentTypes: Array<string>,
  urlMatch: RegExp,
  urlNotMatch?: RegExp
};

const streamTypes: Array<StreamType> = [
  {
    name: 'dash',
    label: 'MPEG DASH',
    contentTypes: ['application/dash+xml'],
    urlMatch: /\.mpd/
  },
  {
    name: 'hls',
    label: 'Apple HLS',
    contentTypes: ['application/x-mpegurl', 'vnd.apple.mpegurl'],
    urlMatch: /\.m3u8/
  },
  {
    name: 'progressive',
    label: 'Progressive (MP4, WebM)',
    contentTypes: ['video/mp4', 'video/webm'],
    urlMatch: /(\.webm|\.mp4)/,
    urlNotMatch: /(\/Manifest|\.mpd|\.m3u8|\.f4m)/
  }
];

const detectStreamType = (streamUrl: string, contentType: ?string): StreamType =>
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
  })[0] || streamTypes[streamTypes.length - 1];

const selectVideoStreamerComponent = (source: PlaybackSource | string | null): ?React.ComponentType<any> => {
  if (source) {
    const contentType = typeof source === 'string' ? null : source.contentType;
    const streamUrl = typeof source === 'string' ? source : source.streamUrl;
    const streamType = detectStreamType(streamUrl, contentType);
    switch (streamType.name) {
      case 'hls':
        const isSafari =
          navigator.userAgent.indexOf('Safari') > 0 &&
          navigator.userAgent.indexOf('Chrome') < 0 &&
          navigator.userAgent.indexOf('Firefox') < 0;
        if (isSafari) {
          return HtmlVideoStreamer;
        } else {
          return HlsjsVideoStreamer;
        }
      case 'dash':
        return ShakaVideoStreamer;
      default:
        return BasicVideoStreamer;
    }
  } else {
    return null;
  }
};

const VideoStreamerResolver = (props: { source: PlaybackSource | string | null }) => {
  const VideoStreamer = selectVideoStreamerComponent(props.source);
  if (VideoStreamer) {
    // $FlowFixMe
    return <VideoStreamer {...props} />;
  } else {
    return null;
  }
};

export default VideoStreamerResolver;
