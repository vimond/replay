//@flow
import type { PlaybackProps, VideoStreamerImplProps, VideoStreamState } from '../types';
import type { TextTrackManager } from '../BasicVideoStreamer/textTrackManager';
import type { AudioTrackManager } from '../BasicVideoStreamer/audioTrackManager';
import type { VideoStreamerConfiguration } from '../types';

export type StreamRangeHelper = {
  adjustForDvrStartOffset: () => void,
  calculateNewState: () => VideoStreamState,
  setPosition: (number) => void,
  gotoLive: () => void
};

export type StreamStateUpdater = {
  eventHandlers: { [string]: () => void },
  //onTextTracksChanged: TextTracksStateProps => void,
  //onAudioTracksChanged: AudioTracksStateProps => void,
  startPlaybackSession: () => void
};

export type SimplifiedVideoStreamer<S: VideoStreamerConfiguration, T: VideoStreamerImplProps<S>> = {
  props: T
};

export type StreamerImplementationParts<C: VideoStreamerConfiguration, P: VideoStreamerImplProps<C>, T> = {
  thirdPartyPlayer: ?T,
  applyProperties: PlaybackProps => void,
  streamStateUpdater: StreamStateUpdater,
  handleSourceChange: (nextProps: P, prevProps?: P) => Promise<any>,
  textTrackManager: TextTrackManager,
  audioTrackManager: AudioTrackManager,
  cleanup: () => Promise<void>
};