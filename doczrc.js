import { css } from 'docz-plugin-css';
//import { createPlugin } from 'docz-core';

// https://github.com/pedronauck/docz/issues/150
/*const staticServePlugin = () => createPlugin({
  onCreateApp: app => {
    app.use(mount(somePath, serveStatic(publicPath)))
  }
});*/

export default {
  title: '◂REPLAY▸',
  description: 'A video player built while thinking in React',
  src: './src/replay',
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
        'Controlling playback programmatically'
      ]
    },
    'Customising Replay',
    'Architecture and patterns',
    'Building a custom player',
    'Controls reference',
    'Generic controls reference'
  ],
  debug: false
};
