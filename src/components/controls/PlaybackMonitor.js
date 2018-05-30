// @flow

import * as React from 'react';
import type { CommonProps } from '../common';
import type { VideoStreamState } from '../player/VideoStreamer/common';
import { defaultClassNamePrefix, isDifferent, prefixClassNames } from '../common';
import Button from '../generic/Button';

type PlaybackMonitorConfiguration = {
  startVisible?: boolean
};

type Props = CommonProps & {
  configuration?: {
    playbackMonitor?: PlaybackMonitorConfiguration
  },
  videoStreamState: VideoStreamState,
  closeButtonContent: React.Node
};

type State = {
  isMonitorVisible: boolean
};

type PrefixedClassNames = {
  propName: string,
  currentValue: string,
  previousValue: string,
  headerRow: string
};

type TableRowProps = {
  videoStreamState: VideoStreamState,
  propertyName: string,
  prefixedClassNames: PrefixedClassNames
};

type TableRowState = {
  currentValue: any,
  previousValue?: any
};

const orderedPropertyNames = [
  'playMode',
  'playState',
  'isPaused',
  'isBuffering',
  'isSeeking',
  'position',
  'duration',
  'absolutePosition',
  'absoluteStartPosition',
  'isAtLivePosition',
  'bufferedAhead',
  'currentBitrate',
  'bitrates',
  'lockedBitrate',
  'maxBitrate',
  'currentTextTrack',
  'textTracks',
  'currentAudioTrack',
  'audioTracks',
  'volume',
  'isMuted',
  'error'
];

const className = 'playback-monitor';
const tableClassName = 'playback-monitor-stream-state';
const headerRowClassName = 'playback-monitor-table-header';
const propNameClassName = 'playback-monitor-property-name';
const currentValueClassName = 'playback-monitor-current-value';
const previousValueClassName = 'playback-monitor-previous-value';
const closeButtonClassName = 'playback-monitor-close-button';

const closeButtonLabel = 'Close';

const formatValue = (val: any): string => {
  if (val instanceof Date) {
    if (isNaN(val.getTime())) {
      return val;
    } else {
      return val.toISOString();
    }
  } else if (typeof val === 'number') {
    if (val % 1 !== 0) {
      return val.toFixed(2);
    } else {
      return val;
    }
  } else if (typeof val === 'function') {
    return 'function :-o';
  } else if (val instanceof Error) {
    const parts = [];
    if (val.message) {
      parts.push(`message: '${val.message}'`);
    }
    if (val.code) {
      parts.push(`code: '${val.code}'`);
    }
    if (val.severity) {
      parts.push(`severity: '${val.severity}'`);
    }
    return `{${parts.join(',')}}`;
  } else if (Array.isArray(val)) {
    return '[' + val.map(formatValue).join(',') + ']';
  } else if (typeof val === 'boolean') {
    return val.toString();
  } else if (typeof val === 'string') {
    return val;
  } else if (val) {
    return JSON.stringify(val)
      .replace(/(")(([A-Z]|[a-z]|[0-9])+)(")(:)/g, '$2$5')
      .replace(/(handlers|props|methods|constants):\{(.*?)},/g, '');
  } else {
    return val;
  }
};

export class PropTableRow extends React.Component<TableRowProps, TableRowState> {
  constructor(props: TableRowProps) {
    super(props);
    this.state = {
      currentValue: props.videoStreamState[props.propertyName]
    };
  }

  static getDerivedStateFromProps(nextProps: TableRowProps, prevState: TableRowState) {
    if (isDifferent(nextProps.videoStreamState[nextProps.propertyName], prevState.currentValue)) {
      return {
        currentValue: nextProps.videoStreamState[nextProps.propertyName],
        previousValue: prevState.currentValue
      };
    } else {
      return null;
    }
  }

  render() {
    const { prefixedClassNames, propertyName } = this.props;
    const { currentValue, previousValue } = this.state;
    const formattedCurrentValue = formatValue(currentValue);
    const formattedPreviousValue = formatValue(previousValue);
    return (
      <tr>
        <th title={propertyName} className={prefixedClassNames.propName}>{propertyName}</th>
        <td title={formattedCurrentValue} className={prefixedClassNames.currentValue}>{formattedCurrentValue}</td>
        <td title={formattedPreviousValue} className={prefixedClassNames.previousValue}>{formattedPreviousValue}</td>
      </tr>
    );
  }
}

const TableHeaderRow = ({ prefixedClassNames }: { prefixedClassNames: PrefixedClassNames }) => (
  <tr className={prefixedClassNames.headerRow}>
    <th className={prefixedClassNames.propName}>Property name</th>
    <th className={prefixedClassNames.currentValue}>Current value</th>
    <th className={prefixedClassNames.previousValue}>Previous value</th>
  </tr>
);

const renderTableRows = (videoStreamState: VideoStreamState, classNamePrefix) => {
  const prefixedClassNames = {
    headerRow: prefixClassNames(classNamePrefix, headerRowClassName),
    propName: prefixClassNames(classNamePrefix, propNameClassName),
    currentValue: prefixClassNames(classNamePrefix, currentValueClassName),
    previousValue: prefixClassNames(classNamePrefix, previousValueClassName)
  };
  return [<TableHeaderRow key="header-row" prefixedClassNames={prefixedClassNames} />].concat(
    orderedPropertyNames.map(propertyName => {
      return (
        <PropTableRow
          key={`prop-row-${propertyName}`}
          prefixedClassNames={prefixedClassNames}
          propertyName={propertyName}
          videoStreamState={videoStreamState}
        />
      );
    })
  );
};

class PlaybackMonitor extends React.Component<Props, State> {
  static defaultProps = {
    classNamePrefix: defaultClassNamePrefix
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      isMonitorVisible: !!(
        props.configuration &&
        props.configuration.playbackMonitor &&
        props.configuration.playbackMonitor.startVisible
      )
    };
    document.addEventListener('keydown', this.handleKeyDown);
  }

  handleCloseClick = () => this.setState({ isMonitorVisible: false });

  handleKeyDown = (keyboardEvent: KeyboardEvent) => {
    if (keyboardEvent.ctrlKey && keyboardEvent.altKey && keyboardEvent.keyCode === 86) {
      // Ctrl + Alt + V
      this.setState({ isMonitorVisible: !this.state.isMonitorVisible });
    }
  };

  render() {
    const { videoStreamState, label, classNamePrefix, closeButtonContent } = this.props;
    if (this.state.isMonitorVisible) {
      return (
        <div title={label} className={prefixClassNames(classNamePrefix, className)}>
          <Button
            className={closeButtonClassName}
            classNamePrefix={classNamePrefix}
            content={closeButtonContent}
            label={closeButtonLabel}
            onClick={this.handleCloseClick}
          />
          <table className={prefixClassNames(classNamePrefix, tableClassName)}>
            <tbody>
            {renderTableRows(videoStreamState, classNamePrefix)}
            </tbody>
          </table>
        </div>
      );
    } else {
      return null;
    }
  }
}

console.log('REACT VERSION', React.version);

export default PlaybackMonitor;
