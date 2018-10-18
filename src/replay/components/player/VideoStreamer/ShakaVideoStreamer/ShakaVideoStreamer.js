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

  const streamRangeHelper = getStreamRangeHelper(videoElement, shakaPlayer, configuration);
  const handleSourceChange = getSourceChangeHandler(shakaPlayer);
  const updateStreamState = getFilteredPropertyUpdater(streamer);

  const textTrackManager = getTextTrackManager(videoElement, updateStreamState); //TODO: Replace with Shaka version.
  const audioTrackManager = getAudioTrackManager(videoElement, updateStreamState);

  const applyProperties = getPropertyApplier(videoElement, streamRangeHelper, textTrackManager, audioTrackManager);

  const streamStateUpdater = { eventHandlers: {}, startPlaybackSession: () => {}, cleanup: () => Promise.resolve() };

  function cleanup() {
    textTrackManager.cleanup();
    audioTrackManager.cleanup();
    streamStateUpdater.cleanup();
    return shakaPlayer.destroy();
  }

  return Promise.resolve({
    cleanup,
    textTrackManager,
    audioTrackManager,
    streamStateUpdater,
    thirdPartyPlayer: shakaPlayer,
    applyProperties,
    handleSourceChange
  });
}

const ShakaVideoStreamer = createVideoStreamerComponent('ShakaVideoStreamer', resolveImplementation);

export default ShakaVideoStreamer;
