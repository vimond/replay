// @flow
import * as React from 'react';
import type { InteractionDetectorConfiguration } from '../components/player/containment-helpers/InteractionDetector';
import type { KeyboardShortcutsConfiguration } from '../components/player/containment-helpers/KeyboardShortcuts';
import type { InitialPlaybackProps, PlaybackSource, SourceTrack, VideoStreamerConfiguration, VideoStreamState } from '../components/player/VideoStreamer/types';
import type { QualitySelectionStrategy } from '../components/controls/QualitySelector/QualitySelector';
import type { LiveDisplayMode } from '../components/controls/TimeDisplay/TimeDisplay';
import type { UserSettingsConfiguration } from '../components/player/settings-helpers/PreferredSettingsApplicator';
import type { PlaybackActions } from '../components/player/PlayerController/PlayerController';

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
  | 'exitButton'
  | 'playbackMonitor'
  | 'bufferingIndicator';

// Some properties are nullable because the null value deletes the base configuration, and this should be allowed.

export type PlayerConfiguration = {
  videoStreamer?: ?VideoStreamerConfiguration,
  interactionDetector?: ?InteractionDetectorConfiguration,
  keyboardShortcuts?: ?KeyboardShortcutsConfiguration,
  userSettings?: ?UserSettingsConfiguration,
  ui?: ?{
    classNamePrefix?: ?string, // Not implemented.
    includeControls?: ?Array<ControlNames>, // Not implemented.
    skipButtonOffset?: number,
    liveDisplayMode?: LiveDisplayMode,
    qualitySelectionStrategy?: QualitySelectionStrategy
  }
};

export type GraphicResources = { [string]: React.Node };
export type StringResources = { [string]: string };

export type UIResources<T> = {
  playPauseButton?: T,
  skipButton?: T,
  timeline?: T,
  timeDisplay?: T,
  gotoLiveButton?: T,
  volume?: T,
  audioSelector?: T,
  subtitlesSelector?: T,
  qualitySelector?: T,
  fullscreenButton?: T,
  bufferingIndicator?: T,
  playbackMonitor?: T,
  exitButton?: T
};

export type PreferredSettings = {
  volume?: ?number,
  isMuted?: ?boolean,
  textTrackLanguage?: ?string,
  textTrackKind?: ?string,
  audioTrackLanguage?: ?string,
  audioTrackKind?: ?string
};

export type ReplayProps = {
  source?: ?PlaybackSource,
  textTracks?: Array<SourceTrack>,
  options?: PlayerConfiguration,
  onExit?: () => void,
  onError?: any => void,
  onPlaybackActionsReady?: (PlaybackActions) => void,
  onStreamStateChange?: VideoStreamState => void,
  children?: React.Element<any>,
  initialPlaybackProps?: InitialPlaybackProps,
  preferredSettings?: PreferredSettings
};
