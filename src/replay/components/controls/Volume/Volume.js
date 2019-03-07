// @flow
import * as React from 'react';
import { defaultClassNamePrefix, prefixClassNames } from '../../common';
import type { CommonProps } from '../../common';
import ToggleButton from '../../generic/ToggleButton/ToggleButton';
import Slider from '../../generic/Slider/Slider';
import type { StreamStateKeysForObservation } from '../../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  /** ⇘︎ The current volume level, a number between 0 and 1. */
  volume?: number,
  /** ⇘︎ The current mute state. false means unmuted. */
  isMuted?: boolean,
  volumeSliderLabel?: string,
  muteToggleLabel?: string,
  /** Element(s) displayed when isMuted is set to true The convention is to display a disabled or "silent" loudspeaker icon. */
  mutedContent: React.Node,
  /** Element(s) displayed when isMuted is set to false The convention is to display a loudspeaker icon with sound waves. */
  unmutedContent: React.Node,
  volumeSliderHandleContent?: React.Node,
  volumeSliderTrackContent?: React.Node,
  /** ⇗ This callback is invoked with { isMuted: true } or { isMuted: false } when the mute button is toggled. If the volume slider handle position is changed, it is invoked with { volume: newLevel } */
  setProperties?: ({ volume: number } | { isMuted: boolean }) => void
};

const className = 'volume';
const disabledClassName = 'volume-disabled';
const muteToggleClassName = 'mute-toggle';
const volumeSliderClassName = 'volume-slider';
const volumeSliderHandleClassName = 'volume-slider-handle';
const volumeSliderTrackClassName = 'volume-slider-track';
const maxVolume = 1;

class Volume extends React.Component<Props> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };

  static streamStateKeysForObservation: StreamStateKeysForObservation = ['volume', 'isMuted'];

  handleMuteToggleClick = (isMuted: boolean) => {
    if (this.props.setProperties) {
      this.props.setProperties({ isMuted });
    }
  };

  handleVolumeSliderChange = (volume: number) => {
    const setProperties = this.props.setProperties;
    if (setProperties) {
      setProperties({ isMuted: false, volume });
    }
  };

  render() {
    const isIos = navigator.userAgent.match(/(iPad|iPhone|iPod)/i);
    const {
      volume,
      isMuted,
      label,
      volumeSliderLabel,
      muteToggleLabel,
      classNamePrefix,
      mutedContent,
      unmutedContent,
      volumeSliderHandleContent,
      volumeSliderTrackContent
    } = this.props;
    const prefixedClassName = prefixClassNames(classNamePrefix, className, isIos && disabledClassName);
    return (
      <div className={prefixedClassName} title={label}>
        <ToggleButton
          label={muteToggleLabel}
          isOn={isMuted}
          toggledOffContent={unmutedContent}
          toggledOnContent={mutedContent}
          onToggle={this.handleMuteToggleClick}
          classNamePrefix={classNamePrefix}
          className={muteToggleClassName}
        />
        {!isIos && (
          <Slider
            label={volumeSliderLabel}
            value={isMuted ? 0 : volume}
            maxValue={maxVolume}
            handleContent={volumeSliderHandleContent}
            trackContent={volumeSliderTrackContent}
            onValueChange={this.handleVolumeSliderChange}
            classNamePrefix={classNamePrefix}
            className={volumeSliderClassName}
            trackClassName={volumeSliderTrackClassName}
            handleClassName={volumeSliderHandleClassName}
          />
        )}
      </div>
    );
  }
}

export default Volume;
