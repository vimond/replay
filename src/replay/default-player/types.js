// @flow
import * as React from 'react';
import type { InteractionDetectorConfiguration } from '../components/player/containment-helpers/InteractionDetector';
import type { KeyboardShortcutsConfiguration } from '../components/player/containment-helpers/KeyboardShortcuts';
import type {
  PlaybackSource,
  SourceTrack,
  VideoStreamerConfiguration
} from '../components/player/VideoStreamer/common';
import type { QualitySelectionStrategy } from '../components/controls/QualitySelector';
import type { LiveDisplayMode } from '../components/controls/TimeDisplay';

export type ControlNames =
  | 'playPauseButton'
  | 'skipButton'
  | 'timeline'
  | 'timeDisplay'
  | 'gotoLiveButton'
  | 'volume'
  | 'audioSelector'
  | 'subtitlesSelector'
  | 'qualitySelector'
  | 'fullscreenButton'
  | 'bufferingIndicator';

// Some properties are nullable because the null value deletes the base configuration, and this should be allowed.

export type PlayerConfiguration = {
  videoStreamer?: ?VideoStreamerConfiguration,
  interactionDetector?: ?InteractionDetectorConfiguration,
  keyboardShortcuts?: ?KeyboardShortcutsConfiguration,
  ui?: ?{
    classNamePrefix?: ?string, // Not implemented.
    includeControls?: ?Array<ControlNames>, // Not implemented.
    skipButtonOffset?: number,
    liveDisplayMode?: LiveDisplayMode,
    qualitySelectionStrategy?: QualitySelectionStrategy
  }
};

export type ReplayProps = {
  source: PlaybackSource,
  textTracks: Array<SourceTrack>,
  options: PlayerConfiguration,
  onExit: () => void,
  children: React.Element<any>
};
