import { css } from 'docz-plugin-css';
//import { createPlugin } from 'docz-core';

// https://github.com/pedronauck/docz/issues/150
/*const staticServePlugin = () => createPlugin({
  onCreateApp: app => {
    app.use(mount(somePath, serveStatic(publicPath)))
  }
});*/

export default {
  title: '‹Replay›',
  plugins: [
    css({
      preprocessor: 'postcss',
      cssmodules: false
    })
  ],
  menu: [
    'Replay',
    'Using the Replay player',
    'Customising Replay',
    'Architecture and patterns',
    'Building a custom player',
    'Controls reference',
    'Generic components reference'
  ],
  debug: false
};
