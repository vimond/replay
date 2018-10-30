import getShakaBitrateManager from './shakaBitrateManager';
import { getMockShakaPlayer } from './shakaEventHandlers.test';
import getFilteredPropertyUpdater from '../common/filteredPropertyUpdater';

let id = 0;

const createVariantTrack = bitrate => {
  return {
    id: id++,
    active: false,
    type: 'variant',
    bandwidth: bitrate
  };
};

const setup = (bitrates = [], currentBitrate, initialPlaybackProps) => {
  const variantTracks = bitrates.map(createVariantTrack);
  if (currentBitrate) {
    const index = bitrates.indexOf(currentBitrate);
    if (index >= 0) {
      variantTracks[index].active = true;
    }
  }
  const { eventHandling, shakaPlayer } = getMockShakaPlayer(variantTracks);
  const { eventHandlers } = eventHandling;

  const onStreamStateChange = jest.fn();
  const streamer = {
    props: { onStreamStateChange, initialPlaybackProps }
  };

  const updateStreamState = getFilteredPropertyUpdater(streamer);

  const bitrateManager = getShakaBitrateManager(streamer, shakaPlayer, updateStreamState);

  return {
    shakaPlayer,
    eventHandlers,
    updateStreamState,
    onStreamStateChange,
    bitrateManager,
    variantTracks
  };
};

test('Shaka bitrate manager updates the bitrates state property based on reported Shaka tracks. It always rounds up when converting to kbps.', () => {
  const { eventHandlers, onStreamStateChange, shakaPlayer } = setup([3000, 5000, 1000, 2000]);
  eventHandlers.streaming();
  eventHandlers.trackschanged();
  //const bitratesUpdate = updateStreamState.mock.calls[0][0].bitrates;
  expect(onStreamStateChange).toHaveBeenCalledWith({ bitrates: [1, 2, 3, 5] });
  expect(onStreamStateChange).toHaveBeenCalledTimes(1);
  shakaPlayer.mock.updateVariantTracks([1234567, 2345678, 7891234].map(createVariantTrack));
  eventHandlers.trackschanged();
  expect(onStreamStateChange).toHaveBeenLastCalledWith({ bitrates: [1235, 2346, 7892] });
  onStreamStateChange.mock.calls.forEach(call => expect(call[0].currentBitrate).toBe(undefined));
});

test('Shaka bitrate manager updates the currentBitrate state property based on Shaka track reported as selected.', () => {
  const { eventHandlers, onStreamStateChange, shakaPlayer } = setup([1234567, 2345678, 7891234, 3456789]);
  eventHandlers.streaming();
  eventHandlers.trackschanged();
  onStreamStateChange.mockClear();
  shakaPlayer.getVariantTracks()[1].active = true;
  eventHandlers.adaptation();
  expect(onStreamStateChange).toHaveBeenCalledWith({ currentBitrate: 2346 });
});

test('Shaka bitrate manager capBitrate() with valid number passed restricts to a max bandwidth, but enables ABR.', () => {
  const { eventHandlers, onStreamStateChange, shakaPlayer, bitrateManager } = setup([
    1234567,
    2345678,
    7891234,
    3456789
  ]);
  eventHandlers.streaming();
  eventHandlers.trackschanged();
  bitrateManager.capBitrate(5000);
  expect(shakaPlayer.configure).toHaveBeenCalledWith({
    abr: { restrictions: { maxBandwidth: 5000000 }, enabled: true }
  });
  expect(onStreamStateChange).toHaveBeenCalledWith({ maxBitrate: 5000 });
  bitrateManager.capBitrate(1000);
  expect(shakaPlayer.configure).toHaveBeenCalledWith({
    abr: { restrictions: { maxBandwidth: 1234567 }, enabled: true }
  });
  expect(onStreamStateChange).toHaveBeenCalledWith({ maxBitrate: 1235 });
});
test('Shaka bitrate manager capBitrate() with Infinity or falsy passed resets max bandwidth and enables ABR.', () => {
  const { eventHandlers, onStreamStateChange, shakaPlayer, bitrateManager } = setup([
    1234567,
    2345678,
    7891234,
    3456789
  ]);
  eventHandlers.streaming();
  eventHandlers.trackschanged();
  bitrateManager.capBitrate(Infinity);
  expect(shakaPlayer.configure).toHaveBeenCalledWith({
    abr: { restrictions: { maxBandwidth: Infinity }, enabled: true }
  });
  expect(onStreamStateChange).toHaveBeenCalledWith({ maxBitrate: null });
  shakaPlayer.configure.mockClear();
  onStreamStateChange.mockClear();
  bitrateManager.capBitrate(1234);
  bitrateManager.capBitrate(null);
  expect(shakaPlayer.configure).toHaveBeenCalledWith({
    abr: { restrictions: { maxBandwidth: Infinity }, enabled: true }
  });
  expect(onStreamStateChange).toHaveBeenCalledWith({ maxBitrate: null });
});
test('Shaka bitrate manager fixBitrate() with "max" passed resets max bandwidth, disables ABR, and selects track with highest bitrate.', () => {
  const { eventHandlers, onStreamStateChange, shakaPlayer, bitrateManager, variantTracks } = setup([
    1234567,
    2345678,
    7891234,
    3456789
  ]);
  eventHandlers.streaming();
  eventHandlers.trackschanged();
  bitrateManager.fixBitrate('max');
  expect(shakaPlayer.configure).toHaveBeenCalledWith({
    abr: { enabled: false, restrictions: { maxBandwidth: Infinity } }
  });
  expect(shakaPlayer.selectVariantTrack).toHaveBeenCalledWith(variantTracks[2]);
  expect(onStreamStateChange).toHaveBeenCalledWith({ bitrateFix: 7892 });
});
test('Shaka bitrate manager fixBitrate() with "min" passed resets max bandwidth, disables ABR, and selects track with lowest bitrate.', () => {
  const { eventHandlers, onStreamStateChange, shakaPlayer, bitrateManager, variantTracks } = setup([
    1234567,
    2345678,
    7891234,
    3456789
  ]);
  eventHandlers.streaming();
  eventHandlers.trackschanged();
  bitrateManager.fixBitrate('min');
  expect(shakaPlayer.configure).toHaveBeenCalledWith({
    abr: { enabled: false, restrictions: { maxBandwidth: Infinity } }
  });
  expect(shakaPlayer.selectVariantTrack).toHaveBeenCalledWith(variantTracks[0]);
  expect(onStreamStateChange).toHaveBeenCalledWith({ bitrateFix: 1235 });
});
test('Shaka bitrate manager fixBitrate() with number passed selects track with matching bitrate, if found, and resets max bandwidth, disables ABR.', () => {
  const { eventHandlers, onStreamStateChange, shakaPlayer, bitrateManager, variantTracks } = setup([
    1234567,
    2345678,
    7891234,
    3456789
  ]);
  eventHandlers.streaming();
  eventHandlers.trackschanged();
  bitrateManager.fixBitrate(3457);
  expect(shakaPlayer.configure).toHaveBeenCalledWith({
    abr: { enabled: false, restrictions: { maxBandwidth: Infinity } }
  });
  expect(shakaPlayer.selectVariantTrack).toHaveBeenCalledWith(variantTracks[3]);
  expect(onStreamStateChange).toHaveBeenCalledWith({ bitrateFix: 3457 });
});
test('Shaka bitrate manager fixBitrate() with no valid number resets max bandwidth, and re-enables ABR.', () => {
  const { eventHandlers, onStreamStateChange, shakaPlayer, bitrateManager, variantTracks } = setup([
    1234567,
    2345678,
    7891234,
    3456789
  ]);
  eventHandlers.streaming();
  eventHandlers.trackschanged();
  bitrateManager.fixBitrate(Infinity);
  expect(shakaPlayer.configure).toHaveBeenCalledWith({
    abr: { enabled: true, restrictions: { maxBandwidth: Infinity } }
  });
  expect(onStreamStateChange).toHaveBeenCalledWith({ bitrateFix: null });
  shakaPlayer.configure.mockClear();
  onStreamStateChange.mockClear();
  expect(shakaPlayer.selectVariantTrack).not.toHaveBeenCalled();
  bitrateManager.fixBitrate(3457); // Just to get a different value in filteredPropertyUpdater.
  shakaPlayer.selectVariantTrack.mockClear();
  bitrateManager.fixBitrate(null);
  expect(shakaPlayer.configure).toHaveBeenCalledWith({
    abr: { enabled: true, restrictions: { maxBandwidth: Infinity } }
  });
  expect(onStreamStateChange).toHaveBeenCalledWith({ bitrateFix: null });
  expect(shakaPlayer.selectVariantTrack).not.toHaveBeenCalled();
});
