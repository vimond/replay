//@flow
import React, { Component } from 'react';
import { Persist } from 'react-persist';
import MockPlayer from './replay/default-player/MockPlayer';
import { Replay } from './replay/';
import type { PlayerConfiguration } from './replay/default-player/types';
import './App.css';
import './replay/replay-default.css';
import type { PlaybackActions } from './replay/components/player/PlayerController/PlayerController';
import { PlaybackError } from './replay/components/player/VideoStreamer/types';
import type { PlaybackSource, SourceTrack } from './replay/components/player/VideoStreamer/types';
import VideoStreamerResolver from './replay/components/player/VideoStreamer/VideoStreamerResolver/VideoStreamerResolver';
import type { MultiTechPlaybackSource } from './replay/components/player/VideoStreamer/VideoStreamerResolver/VideoStreamerResolver';
// import RxVideoStreamer from './replay/components/player/VideoStreamer/RxVideoStreamer/RxVideoStreamer';

type State = {
  useMock?: boolean,
  source: PlaybackSource | null,
  alwaysShowDesignControls: boolean,
  textTracks?: ?Array<SourceTrack>
};

const initialPlaybackProps = { isPaused: true, volume: 0.2 };

const textTracks = [
  {
    kind: 'subtitles',
    language: 'no',
    src: 'subtitles/no.vtt',
    contentType: 'text/vtt;charset="UTF-8"',
    label: 'Norsk'
  },
  {
    kind: 'subtitles',
    language: 'en',
    src: 'subtitles/en.vtt',
    contentType: 'text/vtt;charset="UTF-8"',
    label: 'English'
  },
  {
    kind: 'captions',
    language: 'no',
    src: 'subtitles/no-captions.vtt',
    contentType: 'text/vtt;charset="UTF-8"',
    label: 'Norsk (th)'
  },
  {
    kind: 'captions',
    language: 'en',
    src: 'subtitles/en-captions.vtt',
    contentType: 'text/vtt;charset="UTF-8"',
    label: 'English captions'
  }
];

const widevineStream = {
  streamUrl: 'https://tv2-hls-live.telenorcdn.net/out/u/82018.mpd',
  licenseUrl:
    'https://sumo.tv2.no/license/wvmodular/82018?timeStamp=2018-10-21T17%3A20%3A06%2B0000&contract=8aa97e9f77c2accc9ec33fb4b288dea2&account=source',
  contentType: 'application/dash+xml',
  drmType: 'com.widevine.alpha'
};

const multiSource: MultiTechPlaybackSource = {
  streamUrl: '', // For now, streamUrl must always be specified.
  alternativeStreamResources: [widevineStream]
};

const fairPlayStream: PlaybackSource = {
  streamUrl: 'https://tv2-hls-live.telenorcdn.net/out/u/82018.m3u8',
  licenseUrl:
    'http://localhost:3002/proxy/stream/license/https%3A//sumo.tv2.no/license/fairplay/82018%3FtimeStamp%3D2018-10-30T14%253A25%253A33%252B0000%26contract%3Db639d62fcb132fc7d7f6f7abec3318fe%26account%3Dsource',
  licenseAcquisitionDetails: {
    fairPlayCertificateUrl: 'http://localhost:3002/proxy/stream/http%3A//sumo.tv2.no/atvapp/assets/TV2_certificate.der',
    requestFormat: 'base64' // Legacy FairPlay format.
  }
};

const videoUrls = [
  // 'example-media/adaptive.m3u8',
  {
    streamUrl: 'https://tv2-stream-live-no.telenorcdn.net/out/u/1153546.mpd',
    contentType: 'application/dash+xml'
  },
  'https://progressive-tv2-no.akamaized.net/ismusp/isi_mp4_0/2018-07-24/S_TRENERLYGING_240718_LA(1359781_R224MP41000).mp4',
  'https://progressive-tv2-no.akamaized.net/ismusp/isi_mp4_0/2018-07-20/N_ELGBADER_200718_SIKRO_(1359389_R212MP41000).mp4',
  'http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8',
  'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
  'https://tv2-stream-live-no.telenorcdn.net/out/u/1153546.m3u8',
  {
    streamUrl: 'https://tv2-hls-od.telenorcdn.net/dashvod15/_definst_/amlst:1385976_ps1271_pd672348.smil/manifest.mpd',
    contentType: 'application/dash+xml'
  },
  {
    streamUrl:
      'https://d3bwpqn4orkllw.cloudfront.net/b91c1/EG_5575_TR_47878_MEZ_(47878_ISMUSP).ism/EG_5575_TR_47878_MEZ_(47878_ISMUSP).mpd',
    contentType: 'application/dash+xml'
  },
  fairPlayStream,
  widevineStream,
  multiSource
];

const configOverrides: PlayerConfiguration = {
  videoStreamer: {
    logLevel: 'WARNING'
  },
  playbackMonitor: {
    visibleAtStart: false
  },
  ui: {
    //includeControls: ['playPauseButton', 'timeline', 'timeDisplay', 'gotoLiveButton', 'volume', 'fullscreenButton', 'exitButton']
  }
};

const alwaysDisplayControlsConfig = {
  interactionDetector: {
    inactivityDelay: -1
  }
};

const getPlayerOptionsFromState = state => {
  if (state.alwaysShowDesignControls) {
    // Add override when needed.
    return alwaysDisplayControlsConfig;
  }
};

class App extends Component<void, State> {
  constructor() {
    super();
    this.state = {
      useMock: true,
      alwaysShowDesignControls: true,
      source: videoUrls[0]
    };
    window.setState = stateProps => this.setState(stateProps);
  }

  togglePlayer = () => this.setState({ useMock: !this.state.useMock });

  toggleShowDesignControls = () => this.setState({ alwaysShowDesignControls: !this.state.alwaysShowDesignControls });

  handleStreamUrlFieldChange = (evt: SyntheticEvent<HTMLInputElement>) =>
    this.setState({ source: evt.currentTarget.value });

  handleVideoButtonClick = (index: number) => this.setState({ source: videoUrls[index] });
  handleNoVideoClick = () => this.setState({ source: null });

  handleError = (err: PlaybackError) =>
    console.error('%s [%s] %s: %s', err.severity, err.technology, err.code, err.message, err.sourceError);

  handlePlaybackActions = (actions: PlaybackActions) => {
    window.player = actions;
  };

  toggleTextTracks = () => {
    if (this.state.textTracks) {
      this.setState({ textTracks: null });
    } else {
      this.setState({ textTracks });
    }
  };

  exitPip = () => {
    // $FlowFixMe
    document.exitPictureInPicture && document.exitPictureInPicture();
  };

  render() {
    const { alwaysShowDesignControls, source, useMock, textTracks } = this.state;
    return (
      <div className="App">
        <div className="App-player-panel">
          {useMock ? (
            <div>
              <MockPlayer
                options={{ ...configOverrides, ...getPlayerOptionsFromState(this.state) }}
                onExit={this.togglePlayer}>
                Design mode
              </MockPlayer>
              <p>
                <input
                  id="toggleAlwaysShowControls"
                  checked={alwaysShowDesignControls}
                  type="checkbox"
                  onChange={this.toggleShowDesignControls}
                />
                <label htmlFor="toggleAlwaysShowControls">Never hide the controls bar.</label>
              </p>
            </div>
          ) : (
            <div>
              <Replay
                source={source}
                options={configOverrides}
                onExit={this.togglePlayer}
                onError={this.handleError}
                textTracks={textTracks}
                initialPlaybackProps={initialPlaybackProps}
                onPlaybackActionsReady={this.handlePlaybackActions}>
                <VideoStreamerResolver />
              </Replay>
              <p>
                <input
                  type="url"
                  value={source ? (typeof source === 'string' ? source : source.streamUrl) : ''}
                  onChange={this.handleStreamUrlFieldChange}
                />
              </p>
              <p className="buttons-row">
                {videoUrls.map((_, index) => (
                  <button key={'v-' + index} onClick={() => this.handleVideoButtonClick(index)}>
                    Video {index + 1}
                  </button>
                ))}
                <button onClick={this.handleNoVideoClick}>No video</button>
                <button onClick={this.toggleTextTracks}>Toggle text tracks</button>
                <button onClick={this.exitPip}>Exit PiP</button>
              </p>
            </div>
          )}
        </div>
        <Persist name="app-state" data={this.state} onMount={data => this.setState(data)} />
      </div>
    );
  }
}

export default App;
