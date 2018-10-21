//@flow
import * as React from 'react';
import type { AvailableTrack, PlaybackProps, PlaybackSource, SourceTrack, VideoStreamerImplProps, VideoStreamState } from '../types';
import type { TextTrackManager } from '../BasicVideoStreamer/textTrackManager';
import type { AudioTrackManager } from '../BasicVideoStreamer/audioTrackManager';
import type { VideoStreamerConfiguration } from '../types';

export type StreamRangeHelper = {
  adjustForDvrStartOffset: () => void,
  calculateNewState: () => VideoStreamState,
  setPosition: number => void,
  gotoLive: () => void
};

/*
export type StreamStateUpdater = {
  eventHandlers: { [string]: () => void },
  getLifeCycle: () => PlaybackLifeCycle,
  setLifeCycle: PlaybackLifeCycle => void,
  startPlaybackSession: () => void
};
*/

export type SimplifiedVideoStreamer<S: VideoStreamerConfiguration, T: VideoStreamerImplProps<S>> = {
  props: T
};

export type VideoStreamerRenderer = (
  videoRef: { current: null | HTMLVideoElement },
  videoElementEventHandlers: { [string]: (any) => void },
  props: { source?: ?PlaybackSource, className?: string, classNamePrefix?: string, applyBuiltInStyles?: boolean },
  baseClassName: string,
  styles: {}
) => React.Node;

export type StreamerImplementationParts<C: VideoStreamerConfiguration, P: VideoStreamerImplProps<C>, T> = {
  thirdPartyPlayer?: ?T,
  applyProperties: PlaybackProps => void,
  handleSourceChange: (nextProps: P, prevProps?: P) => Promise<any>,
  textTrackManager: TextTrackManager,
  audioTrackManager: AudioTrackManager,
  startPlaybackSession: () => void,
  videoElementEventHandlers: { [string]: (any) => void },
  render: VideoStreamerRenderer,
  cleanup: () => Promise<void>
};

export type PlaybackLifeCycle = 'new' | 'starting' | 'started' | 'ended' | 'dead' | 'unknown';

export type BitrateManager = {
  lockBitrate: (lockedBitrate: number | 'max' | 'min') => void,
  capBitrate: number => void
};