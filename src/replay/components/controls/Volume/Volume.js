// @flow
import * as React from 'react';
import { defaultClassNamePrefix, prefixClassNames } from '../../common';
import type { CommonProps } from '../../common';
import ToggleButton from '../../generic/ToggleButton/ToggleButton';
import Slider from '../../generic/Slider/Slider';
import type { StreamStateKeysForObservation } from '../../player/PlayerController/ControllerContext';

type Props = CommonProps & {
  volume: number,
  isMuted?: boolean,
  volumeSliderLabel?: string,
  muteToggleLabel?: string,
  mutedContent: React.Node,
  unmutedContent: React.Node,
  volumeSliderHandleContent: React.Node,
  volumeSliderTrackContent: React.Node,
  setProperty?: ({ volume: number } | { isMuted: boolean }) => void
};

const className = 'volume';
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
    if (this.props.setProperty) {
      this.props.setProperty({ isMuted });
    }
  };

  handleVolumeSliderChange = (volume: number) => {
    const setProperty = this.props.setProperty;
    if (setProperty) {
      setProperty({ isMuted: false, volume });
    }
  };

  render() {
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
    const prefixedClassName = prefixClassNames(classNamePrefix, className);
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
      </div>
    );
  }
}

export default Volume;
