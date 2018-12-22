// @flow
import type { VideoStreamerImplProps } from '../types';

import createVideoStreamerComponent from '../common/createVideoStreamerComponent';
import { hlsjsCleanup } from './hlsjsSetup';
import getStreamRangeHelper from './hlsjsStreamRangeHelper';
import getSourceChangeHandler from './hlsjsSourceChangeHandler';
import getFilteredStreamStateUpdater from '../common/filteredStreamStateUpdater';
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

export type HlsjsInstanceKeeper = {
  hls?: Hls,
  videoElement: HTMLVideoElement,
  subscribers: Array<(Hls, 'on' | 'off') => void>
};

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
): Promise<StreamerImplementationParts<HlsjsVideoStreamerConfiguration, HlsjsVideoStreamerProps, HlsjsInstanceKeeper>> {
  const instanceKeeper = {
    videoElement,
    subscribers: []
  };

  const streamRangeHelper = getStreamRangeHelper(videoElement, instanceKeeper, configuration);
  const handleSourceChange = getSourceChangeHandler(instanceKeeper);
  const updateStreamState = getFilteredStreamStateUpdater(streamer);

  const textTrackManager = getTextTrackManager(videoElement, updateStreamState);
  const audioTrackManager = getHlsjsAudioTrackManager(instanceKeeper, updateStreamState);
  const bitrateManager = getHlsjsBitrateManager(
    streamer,
    instanceKeeper,
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

  const hlsjsEventHandlers = getHlsjsEventHandlers({
    streamer,
    videoElement,
    instanceKeeper,
    streamRangeHelper,
    configuration,
    applyProperties,
    updateStreamState,
    log
  });
  const { videoElementEventHandlers, setLifeCycleManager } = hlsjsEventHandlers;

  const playbackLifeCycleManager = getPlaybackLifeCycleManager(
    updateStreamState,
    hlsjsEventHandlers.pauseStreamRangeUpdater,
    getArrayLogger(window, 'lifecycle').log
  );
  setLifeCycleManager(playbackLifeCycleManager);

  function cleanup() {
    textTrackManager.cleanup();
    playbackLifeCycleManager.cleanup();
    return hlsjsCleanup(instanceKeeper);
  }

  const { startPlaybackSession, endPlaybackSession } = playbackLifeCycleManager;
  const thirdPartyPlayer = instanceKeeper;
  const render = renderWithoutSource;

  return Promise.resolve({
    cleanup,
    render,
    textTrackManager,
    audioTrackManager,
    thirdPartyPlayer,
    applyProperties,
    handleSourceChange,
    startPlaybackSession,
    endPlaybackSession,
    videoElementEventHandlers
  });
}

const HlsjsVideoStreamer = createVideoStreamerComponent('HlsjsVideoStreamer', resolveImplementation);

export default HlsjsVideoStreamer;
