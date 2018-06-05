// @flow
import * as React from 'react';
import type { VideoStreamerProps } from './common';
import { defaultClassNamePrefix } from '../../common';
import { VideoEngine } from 'vimond-uniplayer-videoengine-react';
//const VideoEngine = VE.VideoEngine;

const VimondVideoStreamer = ({ classNamePrefix = defaultClassNamePrefix, ...passthrough }: VideoStreamerProps) => (
  <VideoEngine {...passthrough} />
);

export default VimondVideoStreamer;
