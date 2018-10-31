// @flow
import type { VideoStreamerImplProps } from '../types';

import createVideoStreamerComponent from '../common/createVideoStreamerComponent';
import getStreamRangeHelper from './streamRangeHelper';
import getFilteredStreamStateUpdater from '../common/filteredStreamStateUpdater';
import getTextTrackManager from './textTrackManager';
import getAudioTrackManager from './audioTrackManager';
import { getPropertyApplier } from '../common/propertyApplier';
import type { SimplifiedVideoStreamer, StreamerImplementationParts } from '../common/types';
import type { VideoStreamerConfiguration } from '../types';
import getPlaybackLifeCycleManager from '../common/playbackLifeCycleManager';
import getBasicVideoEventHandlers from './basicVideoEventHandlers';
import { renderWithoutSource } from '../common/renderers';
import { getArrayLogger } from '../common/logger';
import getSourceChangeHandler from './sourceChangeHandler';

type BasicVideoStreamerProps = VideoStreamerImplProps<VideoStreamerConfiguration>;
type ThirdPartyPlayer = null;

export function getImplementationResolver(
  sourceChangeHandlerFactory: (
    videoElement: HTMLVideoElement
  ) => (BasicVideoStreamerProps, ?BasicVideoStreamerProps) => Promise<any>
) {
  return function resolveImplementation(
    streamer: SimplifiedVideoStreamer<VideoStreamerConfiguration, BasicVideoStreamerProps>,
    configuration: ?VideoStreamerConfiguration,
    videoElement: HTMLVideoElement
  ): Promise<StreamerImplementationParts<VideoStreamerConfiguration, BasicVideoStreamerProps, ThirdPartyPlayer>> {
    const streamRangeHelper = getStreamRangeHelper(videoElement, configuration); // S
    const handleSourceChange = sourceChangeHandlerFactory(videoElement);

    const updateStreamState = getFilteredStreamStateUpdater(streamer); // G

    const textTrackManager = getTextTrackManager(videoElement, updateStreamState);
    const audioTrackManager = getAudioTrackManager(videoElement, updateStreamState);

    const applyProperties = getPropertyApplier(videoElement, streamRangeHelper, textTrackManager, audioTrackManager); // G
    const { log } = getArrayLogger(window, 'videoEvents');

    const basicHandlers = getBasicVideoEventHandlers({
      streamer,
      videoElement,
      streamRangeHelper,
      configuration,
      applyProperties,
      updateStreamState,
      log
    });
    const { videoElementEventHandlers, setLifeCycleManager } = basicHandlers;

    const playbackLifeCycleManager = getPlaybackLifeCycleManager(
      updateStreamState,
      basicHandlers.pauseStreamRangeUpdater,
      getArrayLogger(window, 'lifecycle').log
    );
    setLifeCycleManager(playbackLifeCycleManager);

    function cleanup() {
      textTrackManager.cleanup();
      audioTrackManager.cleanup();
      playbackLifeCycleManager.cleanup();
      basicHandlers.cleanup();
      return Promise.resolve();
    }

    const { startPlaybackSession } = playbackLifeCycleManager;
    const render = renderWithoutSource;

    return Promise.resolve({
      cleanup,
      render,
      textTrackManager,
      audioTrackManager,
      applyProperties,
      handleSourceChange,
      startPlaybackSession,
      videoElementEventHandlers
    });
  };
}

const BasicVideoStreamer = createVideoStreamerComponent(
  'BasicVideoStreamer',
  getImplementationResolver(getSourceChangeHandler)
);

export default BasicVideoStreamer;
