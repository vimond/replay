// @flow
//$FlowFixMe Flow React types are not up to date.
import { lazy } from 'react';
import type { LazyVideoStreamerSelector } from '../CompoundVideoStreamer';
import { detectStreamType, isSafari } from '../helpers';

const HlsjsVideoStreamer = lazy(() => import('../../HlsjsVideoStreamer/HlsjsVideoStreamer'));
const ShakaVideoStreamer = lazy(() => import('../../ShakaVideoStreamer/ShakaVideoStreamer'));
const HtmlVideoStreamer = lazy(() => import('../../HtmlVideoStreamer/HtmlVideoStreamer'));
const BasicVideoStreamer = lazy(() => import('../../BasicVideoStreamer/BasicVideoStreamer'));

const selectVideoStreamerImporter: LazyVideoStreamerSelector = (source, userAgent) => {
  if (source) {
    const contentType = typeof source === 'string' ? null : source.contentType;
    const streamUrl = typeof source === 'string' ? source : source.streamUrl;
    const extractLicenseUrlFromSkd = typeof source === 'string' ? null : source.licenseAcquisitionDetails?.extractLicenseUrlFromSkd;
    const streamType = detectStreamType(streamUrl, contentType);
    switch (streamType.name) {
      case 'hls':
        if (isSafari(userAgent)) {
          if(source.drmLicenseUri && extractLicenseUrlFromSkd){
            return ShakaVideoStreamer;
          };
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
    return () => BasicVideoStreamer;
  }
};

export default selectVideoStreamerImporter;
