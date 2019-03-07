// @flow
//$FlowFixMe Flow React types are not up to date.
import React, { Suspense, type ComponentType } from 'react';
import type { AdvancedPlaybackSource, PlaybackSource } from '../types';
import { PlaybackError } from '../types';
import selectVideoStreamerImporter from './hlsjs-shaka-html/lazyVideoStreamerSelector';
import selectCompatibleDrmStream from './playready-widevine-fairplay/compatibleStreamSelector';
import memoize from 'memoize-one';

type UnencryptedStreamResource = {|
  streamUrl: string,
  contentType: string
|};

type EncryptedStreamResource = {|
  streamUrl: string,
  contentType: string,
  licenseUrl: string,
  drmType: string
|};

export type StreamResource = UnencryptedStreamResource | EncryptedStreamResource;

export type MultiTechPlaybackSource = AdvancedPlaybackSource & {
  alternativeStreamResources?: Array<StreamResource>
};

export type CompatibleStreamSelector = (
  alternativeStreamResources: Array<StreamResource>,
  userAgent: string
) => StreamResource;

export type LazyVideoStreamerSelector = (source?: PlaybackSource | null, userAgent: string) => ComponentType<any>;

type Props = {
  source?: MultiTechPlaybackSource | string,
  onPlaybackError?: PlaybackError => void
};

export class StreamResourceResolutionError extends PlaybackError {
  constructor(message: string, supportedDrmType?: string, resources?: Array<StreamResource>) {
    const generalMessage =
      ' In order to select the appropriate stream and DRM technology for the current browser, ' +
      'alternative stream resources must be specified with recognizable contentType and drmType properties. Refer ' +
      'the Replay documentation for a listing of the supported and recognized stream content types and DRM types.';
    super('STREAM_ERROR_TECHNOLOGY_UNSUPPORTED', message + generalMessage);
    this.supportedDrmType = supportedDrmType;
    this.availableResources = resources;
  }
  supportedDrmType: ?string;
  availableResources: ?Array<StreamResource>;
}

const normalizeSource = memoize(
  (source: ?(string | MultiTechPlaybackSource)): ?MultiTechPlaybackSource =>
    typeof source === 'string' ? { streamUrl: source } : source
);

const mergeAndMemoize = memoize(<A, B>(a: A, b: B) => {
  return { ...a, ...b };
});

const mergeAndMemoizePropsWithSource = memoize((props: Props, source: MultiTechPlaybackSource) => {
  return { ...props, source };
});

export const createVideoStreamerResolver = (
  selectCompatibleStream: CompatibleStreamSelector,
  selectLazyVideoStreamer: LazyVideoStreamerSelector
) => {
  return (props: Props) => {
    let source = normalizeSource(props.source);
    const alternativeStreamResources = source && typeof source !== 'string' ? source.alternativeStreamResources : null;
    if (Array.isArray(alternativeStreamResources)) {
      try {
        source = mergeAndMemoize(source, selectCompatibleStream(alternativeStreamResources, navigator.userAgent));
      } catch (err) {
        if (err instanceof StreamResourceResolutionError) {
          if (props.onPlaybackError) {
            props.onPlaybackError(err);
          }
          source = null;
        } else {
          throw err;
        }
      }
    }
    if (source) {
      const VideoStreamer = selectLazyVideoStreamer(source, navigator.userAgent);
      const modifiedProps = mergeAndMemoizePropsWithSource(props, source);
      if (VideoStreamer) {
        return (
          <Suspense fallback={<div />}>
            <VideoStreamer {...modifiedProps} />
          </Suspense>
        );
      } else {
        return null;
      }
    } else {
      return null;
    }
  };
};

const VideoStreamerResolver = createVideoStreamerResolver(selectCompatibleDrmStream, selectVideoStreamerImporter);
export default VideoStreamerResolver;
