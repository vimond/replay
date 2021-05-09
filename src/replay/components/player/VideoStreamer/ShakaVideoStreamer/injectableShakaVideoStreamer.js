// @flow
import type { VideoStreamerImplProps } from '../types';

import createVideoStreamerComponent from '../common/createVideoStreamerComponent';
import type { Shaka, ShakaPlayer, ShakaRequestFilter, ShakaResponseFilter } from './types';
import { shakaSetup, shakaCleanup } from './shakaSetup';
import getStreamRangeHelper from './shakaStreamRangeHelper';
import getSourceChangeHandler from './shakaSourceChangeHandler';
import getFilteredStreamStateUpdater from '../common/filteredStreamStateUpdater';
import { getPropertyApplier } from '../common/propertyApplier';
import type { SimplifiedVideoStreamer, StreamerImplementationParts } from '../common/types';
import type { VideoStreamerConfiguration } from '../types';
import getPlaybackLifeCycleManager from '../common/playbackLifeCycleManager';
import getShakaEventHandlers from './shakaEventHandlers';
import { renderWithoutSource } from '../common/renderers';
import { getArrayLogger } from '../common/logger';
import getShakaBitrateManager from './shakaBitrateManager';
import getShakaTextTrackManager from './shakaTextTrackManager';
import getShakaAudioTrackManager from './shakaAudioTrackManager';
import mapShakaError from './shakaErrorMapper';

export type ShakaVideoStreamerConfiguration = VideoStreamerConfiguration & {
  shakaPlayer?: ?{
    installPolyfills?: boolean,
    customConfiguration?: any, // Actually the config structure that can be passed to shaka.Player::configure.
    requestFilter?: ?ShakaRequestFilter,
    responseFilter?: ?ShakaResponseFilter
  }
};

export type ShakaVideoStreamerProps = VideoStreamerImplProps<ShakaVideoStreamerConfiguration> & {
  shakaRequestFilter?: ?ShakaRequestFilter,
  shakaResponseFilter?: ?ShakaResponseFilter
};
const withShakaLibrary = (shakaLib: Shaka) => (
  streamer: SimplifiedVideoStreamer<ShakaVideoStreamerConfiguration, ShakaVideoStreamerProps>,
  configuration: ?ShakaVideoStreamerConfiguration,
  videoElement: HTMLVideoElement
): Promise<StreamerImplementationParts<ShakaVideoStreamerConfiguration, ShakaVideoStreamerProps, ShakaPlayer>> => {
  let shakaPlayer;
  try {
    shakaPlayer = shakaSetup(shakaLib, videoElement, configuration);
  } catch (e) {
    return Promise.reject(mapShakaError(shakaLib, false, e));
  }

  const streamRangeHelper = getStreamRangeHelper(videoElement, shakaPlayer, configuration); // S
  const handleSourceChange = getSourceChangeHandler(shakaLib, shakaPlayer); // S
  const updateStreamState = getFilteredStreamStateUpdater(streamer); // G

  const textTrackManager = getShakaTextTrackManager(shakaPlayer, updateStreamState);
  const audioTrackManager = getShakaAudioTrackManager(shakaPlayer, updateStreamState);
  const bitrateManager = getShakaBitrateManager(
    streamer,
    shakaPlayer,
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

  const shakaEventHandlers = getShakaEventHandlers({
    shakaLib,
    streamer,
    videoElement,
    shakaPlayer,
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
    return shakaCleanup(shakaPlayer);
  }

  const { startPlaybackSession, endPlaybackSession } = playbackLifeCycleManager;
  const thirdPartyPlayer = shakaPlayer;
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
};

const createVideoStreamerWithShakaLibrary = (shakaLibrary: Shaka) =>
  createVideoStreamerComponent('ShakaVideoStreamer', withShakaLibrary(shakaLibrary));

export default createVideoStreamerWithShakaLibrary;
