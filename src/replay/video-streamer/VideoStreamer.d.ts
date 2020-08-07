import * as React from "react";
import { InitialPlaybackProps, PlaybackError, PlaybackSource, ReplayProps, SourceTrack, VideoStreamState } from '../../../typescript-declarations/Replay';

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

declare class VideoStreamer extends React.Component<VideoStreamerProps> {}
export default VideoStreamer;
