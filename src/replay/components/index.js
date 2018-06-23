// @flow
import AudioSelector from './controls/AudioSelector';
import BufferingIndicator from './controls/BufferingIndicator';
import ControlsBar from './controls/ControlsBar';
import FullscreenButton from './controls/FullscreenButton';
import GotoLiveButton from './controls/GotoLiveButton';
import PlaybackMonitor from './controls/PlaybackMonitor';
import PlayPauseButton from './controls/PlayPauseButton';
import QualitySelector from './controls/QualitySelector';
import SkipButton from './controls/SkipButton';
import SubtitlesSelector from './controls/SubtitlesSelector';
import TimeDisplay from './controls/TimeDisplay';
import Timeline from './controls/Timeline';
import Volume from './controls/Volume';

import Button from './generic/Button';
import Container from './generic/Container';
import DropUpSelector from './generic/DropUpSelector';
import Slider from './generic/Slider';
import ToggleButton from './generic/ToggleButton';

import AspectRatio from './player/containment-helpers/AspectRatio';
import Fullscreen from './player/containment-helpers/Fullscreen';
import InteractionDetector from './player/containment-helpers/InteractionDetector';
import KeyboardShortcuts from './player/containment-helpers/KeyboardShortcuts';
import PlayerStateClassNames from './player/containment-helpers/PlayerStateClassNames';

import BasicVideoStreamer from './player/VideoStreamer/BasicVideoStreamer';
import MockVideoStreamer from './player/VideoStreamer/MockVideoStreamer';

import PlayerController from './player/PlayerController/PlayerController';
import { ControlledVideoStreamer } from './player/PlayerController/connectControl';
import PlayerUiContainer from './player/PlayerUiContainer';import * as common from './common';

import { getConnectedPlayerUiContainer } from './player/PlayerUiContainer';
import connectControl from './player/PlayerController/connectControl';
import playerStateClassNameBuilder from './player/containment-helpers/playerStateClassNameBuilder';

export {
  AudioSelector,
  BufferingIndicator,
  ControlsBar,
  FullscreenButton,
  GotoLiveButton,
  PlaybackMonitor,
  PlayPauseButton,
  QualitySelector,
  SkipButton,
  SubtitlesSelector,
  TimeDisplay,
  Timeline,
  Volume,

  Button,
  Container,
  DropUpSelector,
  Slider,
  ToggleButton,
  
  AspectRatio,
  Fullscreen,
  InteractionDetector,
  KeyboardShortcuts,
  PlayerStateClassNames,
  
  BasicVideoStreamer,
  MockVideoStreamer,
  
  PlayerUiContainer,
  PlayerController,
  ControlledVideoStreamer,

  getConnectedPlayerUiContainer,
  connectControl,
  playerStateClassNameBuilder,
  common
};

// TODO: Look into reexporting also types.