// @flow
import createVideoStreamerComponent from '../common/createVideoStreamerComponent';
import { getImplementationResolver } from '../BasicVideoStreamer/BasicVideoStreamer';
import getSourceChangeHandler from './fairPlaySourceChangeHandler';

const HtmlVideoStreamer = createVideoStreamerComponent(
  'HtmlVideoStreamer',
  getImplementationResolver(getSourceChangeHandler)
);

export default HtmlVideoStreamer;
