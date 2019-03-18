import { baseConfiguration } from '../../../default-player/baseConfiguration';
import composePlayer from '../../../playerComposer';
import renderPlayerUI from './renderPlayerUI';

const CustomPlayer = composePlayer({
  name: 'CustomPlayer',
  uiRenderMethod: renderPlayerUI,
  configuration: baseConfiguration
});

export default CustomPlayer;
