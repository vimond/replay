// @flow
import type { VideoStreamerImplProps } from '../types';

import createVideoStreamerComponent from '../common/createVideoStreamerComponent';
import { hlsjsSetup, hlsjsCleanup } from './hlsjsSetup';
import getStreamRangeHelper from './hlsjsStreamRangeHelper';
import getSourceChangeHandler from './hlsjsSourceChangeHandler';
import getFilteredPropertyUpdater from '../common/filteredPropertyUpdater';
import { getPropertyApplier } from '../common/propertyApplier';
import type { SimplifiedVideoStreamer, StreamerImplementationParts } from '../common/types';
import type { VideoStreamerConfiguration } from '../types';
import getPlaybackLifeCycleManager from '../common/playbackLifeCycleManager';
import { renderWithoutSource } from '../common/renderers';
import { getArrayLogger } from '../common/logger';
import getHlsjsAudioTrackManager from './hlsjsAudioTrackManager';
import Hls from 'hls.js';
import getTextTrackManager from '../BasicVideoStreamer/textTrackManager';
import getHlsjsBitrateManager from './hlsjsBitrateManager';
import getHlsjsEventHandlers from './hlsjsEventHandlers';

export type HlsjsVideoStreamerConfiguration = VideoStreamerConfiguration & {
  hlsjs: {
    customConfiguration?: any
  }
};

export type HlsjsVideoStreamerProps = VideoStreamerImplProps<HlsjsVideoStreamerConfiguration>;

function resolveImplementation(
  streamer: SimplifiedVideoStreamer<HlsjsVideoStreamerConfiguration, HlsjsVideoStreamerProps>,
  configuration: ?HlsjsVideoStreamerConfiguration,
  videoElement: HTMLVideoElement
): Promise<StreamerImplementationParts<HlsjsVideoStreamerConfiguration, HlsjsVideoStreamerProps, Hls>> {
  return hlsjsSetup(videoElement, configuration).then(hls => {
    const streamRangeHelper = getStreamRangeHelper(videoElement, hls, configuration);
    const handleSourceChange = getSourceChangeHandler(hls);
    const updateStreamState = getFilteredPropertyUpdater(streamer);

    const textTrackManager = getTextTrackManager(videoElement, updateStreamState);
    const audioTrackManager = getHlsjsAudioTrackManager(hls, updateStreamState);
    const bitrateManager = getHlsjsBitrateManager(
      streamer,
      hls,
      updateStreamState,
      getArrayLogger(window, 'bitrateManager').log
    );

    const applyProperties = getPropertyApplier(
      videoElement,
      streamRangeHelper,
      textTrackManager,
      audioTrackManager,
      bitrateManager
    ); // G

    const { log } = getArrayLogger(window, 'videoEvents');

    const shakaEventHandlers = getHlsjsEventHandlers({
      streamer,
      videoElement,
      hls,
      streamRangeHelper,
      configuration,
      applyProperties,
      updateStreamState,
      log
    });
    const { videoElementEventHandlers, setLifeCycleManager } = shakaEventHandlers;

    const playbackLifeCycleManager = getPlaybackLifeCycleManager(
      updateStreamState,
      shakaEventHandlers.pauseStreamRangeUpdater,
      getArrayLogger(window, 'lifecycle').log
    );
    setLifeCycleManager(playbackLifeCycleManager);

    function cleanup() {
      textTrackManager.cleanup();
      audioTrackManager.cleanup();
      playbackLifeCycleManager.cleanup();
      shakaEventHandlers.cleanup();
      bitrateManager.cleanup();
      return hlsjsCleanup(hls);
    }

    const { startPlaybackSession } = playbackLifeCycleManager;
    const thirdPartyPlayer = hls;
    const render = renderWithoutSource;

    return {
      cleanup,
      render,
      textTrackManager,
      audioTrackManager,
      thirdPartyPlayer,
      applyProperties,
      handleSourceChange,
      startPlaybackSession,
      videoElementEventHandlers
    };
  });
}

const HlsjsVideoStreamer = createVideoStreamerComponent('HlsjsVideoStreamer', resolveImplementation);

export default HlsjsVideoStreamer;
