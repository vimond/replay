// @flow
import { baseConfiguration } from './baseConfiguration';
import composePlayer from '../playerComposer';
import graphics from './default-skin/graphics';
import strings from './strings';

const Replay = composePlayer({
  name: 'Replay',
  graphics,
  strings,
  configuration: baseConfiguration // Already added as default value.
});

// This is the component to be consumed in a full React SPA.
export default Replay;
