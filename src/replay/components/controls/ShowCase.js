// @flow
import * as React from 'react';
import type { PlaybackProps, VideoStreamState } from '../player/VideoStreamer/types';
import '../../replay-default.css';

type Props = {
  render: (VideoStreamState & { setProperties: PlaybackProps => void }) => React.Node,
  height?: string
};

const convertPropsToState = (props: PlaybackProps): VideoStreamState => {
  const state: VideoStreamState = {};
  Object.keys(props).forEach(key => {
    // $FlowFixMe Cheating by mixing PlaybackProps and VideoStreamState.
    let value = props[key];
    switch (key) {
      case 'selectedAudioTrack':
        // $FlowFixMe Cheating by mixing PlaybackProps and VideoStreamState.
        state['currentAudioTrack'] = value;
        break;
      case 'selectedTextTrack':
        // $FlowFixMe Cheating by mixing PlaybackProps and VideoStreamState.
        state['currentTextTrack'] = value;
        break;
      default:
        // $FlowFixMe Cheating by mixing PlaybackProps and VideoStreamState.
        state[key] = value;
    }
  });
  return state;
};

class ShowCase extends React.Component<Props, VideoStreamState> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  // $FlowFixMe Cheating by mixing PlaybackProps and VideoStreamState. Should work well for most of the props.
  setProperties = (props: PlaybackProps) => this.setState(convertPropsToState(props));

  render() {
    const { setProperties, state } = this;
    const { render, height } = this.props;
    const style = height ? { width: '100%', height } : { width: '100%' };
    return (
      <div>
        <div style={style} />
        <div className="replay-controls-bar" style={{ justifyContent: 'center' }}>
          {render({ ...state, setProperties })}
        </div>
      </div>
    );
  }
}
export default ShowCase;
