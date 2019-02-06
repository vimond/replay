// @flow
import type { VideoStreamerImplProps } from '../types';
import createVideoStreamerComponent from '../common/createVideoStreamerComponent';
import getStreamRangeHelper from './rxStreamRangeHelper';
import getSourceChangeHandler from './rxSourceChangeHandler';
import getFilteredStreamStateUpdater from '../common/filteredStreamStateUpdater';
import { getPropertyApplier } from '../common/propertyApplier';
import type { SimplifiedVideoStreamer, StreamerImplementationParts } from '../common/types';
import type { VideoStreamerConfiguration } from '../types';
import getPlaybackLifeCycleManager from '../common/playbackLifeCycleManager';
import getRxEventHandlers from './rxEventHandlers';
import { renderWithoutSource } from '../common/renderers';
import { getArrayLogger } from '../common/logger';
import RxPlayer from 'rx-player';

export type RxVideoStreamerConfiguration = VideoStreamerConfiguration & {
  rxPlayer?: ?{
    customConfiguration?: any
  }
};

export type RxVideoStreamerProps = VideoStreamerImplProps<RxVideoStreamerConfiguration>;

function resolveImplementation(
  streamer: SimplifiedVideoStreamer<RxVideoStreamerConfiguration, RxVideoStreamerProps>,
  configuration: ?RxVideoStreamerConfiguration,
  videoElement: HTMLVideoElement
): Promise<StreamerImplementationParts<RxVideoStreamerConfiguration, RxVideoStreamerProps, any>> {
  const options = configuration && configuration.rxPlayer && configuration.rxPlayer.customConfiguration;
  const logLevel = configuration && configuration.logLevel;
  if (logLevel) {
    RxPlayer.LogLevel = logLevel; // 1:1 mapping on possible values between Replay and RxPlayer. How nice!
  }

  const rxPlayer = new RxPlayer({ stopAtEnd: true, ...options, videoElement });
  videoElement.autoplay = false;

  const streamRangeHelper = getStreamRangeHelper(rxPlayer, configuration);
  const handleSourceChange = getSourceChangeHandler(rxPlayer);
  const updateStreamState = getFilteredStreamStateUpdater(streamer);

  const applyProperties = getPropertyApplier(videoElement, streamRangeHelper);

  const { log } = getArrayLogger(window, 'videoEvents');

  const rxEventHandlers = getRxEventHandlers({
    streamer,
    videoElement,
    rxPlayer,
    streamRangeHelper,
    configuration,
    applyProperties,
    updateStreamState,
    log
  });
  const { videoElementEventHandlers, setLifeCycleManager } = rxEventHandlers;

  const playbackLifeCycleManager = getPlaybackLifeCycleManager(
    updateStreamState,
    rxEventHandlers.pauseStreamRangeUpdater,
    getArrayLogger(window, 'lifecycle').log
  );
  setLifeCycleManager(playbackLifeCycleManager);

  function cleanup() {
    playbackLifeCycleManager.cleanup();
    rxEventHandlers.cleanup();
    rxPlayer.stop();
    rxPlayer.dispose();
    return Promise.resolve();
  }

  const { startPlaybackSession, endPlaybackSession } = playbackLifeCycleManager;
  const thirdPartyPlayer = rxPlayer;
  const render = renderWithoutSource;

  return Promise.resolve({
    cleanup,
    render,
    thirdPartyPlayer,
    applyProperties,
    handleSourceChange,
    startPlaybackSession,
    endPlaybackSession,
    videoElementEventHandlers,
    textTrackManager: {
      handleSourcePropChange: () => {},
      cleanup: () => {},
      handleSelectedTextTrackChange: () => {},
      handleTextTracksPropChange: () => {},
      clear: () => {}
    },
    audioTrackManager: { handleSourceChange: () => {}, cleanup: () => {}, handleSelectedAudioTrackChange: () => {} }
  });
}

const RxVideoStreamer = createVideoStreamerComponent('RxVideoStreamer', resolveImplementation);

export default RxVideoStreamer;
