import { css } from 'docz-plugin-css';
//import { createPlugin } from 'docz-core';

// https://github.com/pedronauck/docz/issues/150
/*const staticServePlugin = () => createPlugin({
  onCreateApp: app => {
    app.use(mount(somePath, serveStatic(publicPath)))
  }
});*/

export default {
  title: 'Replay',
  description: 'A React video player with adaptive streaming support',
  src: './src/replay',
  dest: './docs',
  public: '/public',
  base: '/replay/',
  hashRouter: true,
  plugins: [
    css({
      preprocessor: 'postcss',
      cssmodules: false
    })
  ],
  htmlContext: {
    head: {
      links: [{
        rel: 'stylesheet',
        href: 'https://codemirror.net/theme/dracula.css'
      }]
    }
  },
  themeConfig: {
    showPlaygroundEditor: true,
    codemirrorTheme: 'dracula'
  },
  menu: [
    'Replay',
    {
      name: 'Using the Replay player',
      menu: [
        'Inserting Replay',
        'Setting startup options',
        'Controlling playback programmatically',
        'Replay component API'
      ]
    },
    {
      name: 'Advanced playback',
      menu: [
        'Adaptive streaming',
        'DRM',
        'Subtitles and audio tracks',
        'Bitrates and adaptive quality selection'
      ]
    },
    'Customising Replay',
    {
      name: 'Architecture and patterns',
      menu: [
        'Overview',
        'Video streamers',
        'Player controller',
        'Connected controls',
        'Background'
      ]
    },
    {
      name: 'Building a custom player',
      menu: [
        'Overview',
        'How to add new controls or overlays',
        'How to change graphics or texts'
      ]
    },
    {
      name: 'Reference',
      menu: [
        'Stream state properties',
        'Settable properties',
        'Replay component reference'
      ]
    },
    'Controls reference',
    'Containers/helpers reference',
    'Generic controls reference'
  ],
  debug: false
};
