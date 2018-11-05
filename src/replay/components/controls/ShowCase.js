// @flow
import * as React from 'react';
import type { PlaybackProps, VideoStreamState } from '../player/VideoStreamer/types';
import '../../replay-default.css';

type Props = {
  render: (VideoStreamState & { setProperties: PlaybackProps => void }) => React.Node //TODO: Render prop instead.
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
    return (
      <div>
        <div style={{ width: '100%', height: '100px' }} />
        <div className="replay-controls-bar" style={{ justifyContent: 'center' }}>
          {this.props.render({ ...state, setProperties })}
        </div>
      </div>
    );
  }
}
export default ShowCase;
