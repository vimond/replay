import * as React from "react";
import { InitialPlaybackProps, PlaybackError, PlaybackSource, ReplayProps, SourceTrack, VideoStreamState } from './Replay';

type VideoStreamerMethods = {
  setProperties: (props: any) => void
}

type VideoStreamerProps = {
  source?: PlaybackSource,
  textTracks?: SourceTrack[],
  className?: string,
  initialPlaybackProps?: InitialPlaybackProps,
  onReady?: (methods: VideoStreamerMethods) => void,
  onStreamStateChange?: (state: VideoStreamState) => void,
  onProgress?: ({ event: string }) => void,
  onPlaybackError?: (err: PlaybackError) => void
};

declare class VideoStreamer extends React.Component<VideoStreamerProps, any> {}

export declare class BasicVideoStreamer extends VideoStreamer {}
export declare class HtmlVideoStreamer extends VideoStreamer {}
export declare class ShakaVideoStreamer extends VideoStreamer {}
export declare class ShakaDebugVideoStreamer extends VideoStreamer {}
export declare class HlsjsVideoStreamer extends VideoStreamer {}
export declare class CompoundVideoStreamer extends VideoStreamer {}
export declare class RxVideoStreamer extends VideoStreamer {}
export declare class MockVideoStreamer extends VideoStreamer {}

export default VideoStreamer;
