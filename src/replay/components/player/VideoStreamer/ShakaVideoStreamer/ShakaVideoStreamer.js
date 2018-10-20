// @flow
import * as React from 'react';
import type { VideoStreamerImplProps } from '../types';

import createVideoStreamerComponent from '../common/createVideoStreamerComponent';
import type { ShakaPlayer, ShakaRequestFilter, ShakaResponseFilter } from './types';
import { setup } from './setup';
import getStreamRangeHelper from './streamRangeHelper';
import getSourceChangeHandler from './sourceHandler';
import getFilteredPropertyUpdater from '../common/filteredPropertyUpdater';
import getTextTrackManager from '../BasicVideoStreamer/textTrackManager';
import getAudioTrackManager from '../BasicVideoStreamer/audioTrackManager';
import { getPropertyApplier } from '../common/propertyApplier';
import type { SimplifiedVideoStreamer, StreamerImplementationParts } from '../common/types';
import type { VideoStreamerConfiguration } from '../types';
import getPlaybackLifeCycleManager from '../common/playbackLifeCycleManager';
import getShakaEventHandlers from './shakaEventHandlers';

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

  const applyProperties = getPropertyApplier(videoElement, streamRangeHelper, textTrackManager, audioTrackManager); // G

  // $FlowFixMe streamer.props is not accepted because it contains a lot of members not defined and required by shakaEventHandlers.
  const shakaEventHandlers = getShakaEventHandlers({ streamer, videoElement, thirdPartyPlayer: shakaPlayer, streamRangeHelper, configuration, applyProperties, updateStreamState });
  const { videoElementEventHandlers, setLifeCycleManager } = shakaEventHandlers;
  
  
  const playbackLifeCycleManager = getPlaybackLifeCycleManager(updateStreamState, shakaEventHandlers.pauseStreamRangeUpdater);
  setLifeCycleManager(playbackLifeCycleManager);
  
  function cleanup() {
    textTrackManager.cleanup();
    audioTrackManager.cleanup();
    playbackLifeCycleManager.cleanup();
    shakaEventHandlers.cleanup();
    return shakaPlayer.destroy();
  }

  const { startPlaybackSession } = playbackLifeCycleManager;
  const thirdPartyPlayer = shakaPlayer;
  
  return Promise.resolve({
    cleanup,
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
