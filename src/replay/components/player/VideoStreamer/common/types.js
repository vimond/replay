//@flow
import * as React from 'react';
import type {
  AvailableTrack,
  PlaybackProps,
  PlaybackSource,
  SourceTrack,
  VideoStreamerImplProps,
  VideoStreamState
} from '../types';
import type { VideoStreamerConfiguration } from '../types';

export type PlaybackLifeCycle = 'new' | 'starting' | 'started' | 'dead' | 'unknown';

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

export type TrackElementData = {
  src: string,
  srclang?: string,
  label?: string,
  kind: string,
  onRef?: (?HTMLTrackElement) => void
};

export type VideoStreamerRenderer = (
  videoRef: { current: null | HTMLVideoElement },
  videoElementEventHandlers: { [string]: (any) => void },
  props: { source?: ?PlaybackSource, className?: string, classNamePrefix?: string },
  textTracks?: ?Array<TrackElementData>,
  baseClassName: string,
  styles?: any
) => React.Node;

export type AudioTrackManager = {
  handleSelectedAudioTrackChange: (?AvailableTrack) => void,
  handleSourceChange: () => void,
  cleanup: () => void
};

export type TextTrackManager = {
  handleSelectedTextTrackChange: (?AvailableTrack) => void,
  handleSourcePropChange: ({ source?: ?PlaybackSource, textTracks?: ?Array<SourceTrack> }) => void,
  handleTextTracksPropChange: (newProps: { source?: ?PlaybackSource, textTracks?: ?Array<SourceTrack> }) => void,
  clear: () => void,
  cleanup: () => void
};

export type BitrateManager = {
  fixBitrate: (bitrateFix: number | 'max' | 'min') => void,
  capBitrate: number => void
};

export type StreamerImplementationParts<C: VideoStreamerConfiguration, P: VideoStreamerImplProps<C>, T> = {
  thirdPartyPlayer?: ?T,
  applyProperties: PlaybackProps => void,
  handleSourceChange: (nextProps: P, prevProps?: P) => Promise<any>,
  textTrackManager: TextTrackManager,
  audioTrackManager: AudioTrackManager,
  startPlaybackSession: () => void,
  endPlaybackSession: (stage?: PlaybackLifeCycle) => void,
  videoElementEventHandlers: { [string]: (any) => void },
  render: VideoStreamerRenderer,
  cleanup: () => Promise<void>
};
