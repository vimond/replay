// @flow
import type { VideoStreamerImplProps } from '../types';

import createVideoStreamerComponent from '../common/createVideoStreamerComponent';
import type { ShakaPlayer, ShakaRequestFilter, ShakaResponseFilter } from './types';
import { setup } from './setup';
import getStreamRangeHelper from './shakaStreamRangeHelper';
import getSourceChangeHandler from './shakaSourceChangeHandler';
import getFilteredPropertyUpdater from '../common/filteredPropertyUpdater';
import getTextTrackManager from '../BasicVideoStreamer/textTrackManager';
import getAudioTrackManager from '../BasicVideoStreamer/audioTrackManager';
import { getPropertyApplier } from '../common/propertyApplier';
import type { SimplifiedVideoStreamer, StreamerImplementationParts } from '../common/types';
import type { VideoStreamerConfiguration } from '../types';
import getPlaybackLifeCycleManager from '../common/playbackLifeCycleManager';
import getShakaEventHandlers from './shakaEventHandlers';
import { renderWithoutSource } from '../common/renderers';
import { getArrayLogger } from '../common/logger';
import getShakaBitrateManager from './shakaBitrateManager';

export type ShakaVideoStreamerConfiguration = VideoStreamerConfiguration & {
  shakaPlayer?: ?{
    installPolyfills?: boolean,
    playerConfiguration?: any // Actually the config structure that can be passed to shaka.Player::configure.
  }
};

export type ShakaVideoStreamerProps = VideoStreamerImplProps<ShakaVideoStreamerConfiguration> & {
  shakaRequestFilter?: ?ShakaRequestFilter,
  shakaResponseFilter?: ?ShakaResponseFilter
};

function resolveImplementation(
  streamer: SimplifiedVideoStreamer<ShakaVideoStreamerConfiguration, ShakaVideoStreamerProps>,
  configuration: ?ShakaVideoStreamerConfiguration,
  videoElement: HTMLVideoElement
): Promise<StreamerImplementationParts<ShakaVideoStreamerConfiguration, ShakaVideoStreamerProps, ShakaPlayer>> {
  const shakaPlayer = setup(videoElement, configuration);

  const streamRangeHelper = getStreamRangeHelper(videoElement, shakaPlayer, configuration); // S
  const handleSourceChange = getSourceChangeHandler(shakaPlayer); // S
  const updateStreamState = getFilteredPropertyUpdater(streamer); // G

  const textTrackManager = getTextTrackManager(videoElement, updateStreamState); //TODO: Replace with Shaka version.
  const audioTrackManager = getAudioTrackManager(videoElement, updateStreamState); //TODO: Replace with Shaka version.
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
    return shakaPlayer.destroy();
  }

  const { startPlaybackSession } = playbackLifeCycleManager;
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
    videoElementEventHandlers
  });
}

const ShakaVideoStreamer = createVideoStreamerComponent('ShakaVideoStreamer', resolveImplementation);

export default ShakaVideoStreamer;
