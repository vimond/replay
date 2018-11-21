# Replay

This is a personal training project coded outside office hours.

Replay is a **Re**act **play**er controls component library and a full player component, independent to Vimond environments and earlier player projects.

It is also intended to be a **replay**cement for the legacy and non-React Vimond **Re**ference **Play**er currently used for testing streams in [Streamlab](http://streamlab.ops.vmp.vimondtv.com/).

It constitutes a tiny framework that allows for wrapping and plugging in advanced streaming and playback technologies as first-class React components. The goal is "thinking in React" as much as possible.

So far it integrates with [Shaka Player](https://github.com/google/shaka-player), partly [Rx-player](https://github.com/canalplus/rx-player), and [HLS.js](https://github.com/video-dev/hls.js). That covers MPEG-DASH, HLS, and smooth streams.

The Replay player also aims to "get the job done" when it comes to simply embedding a video file to be played in a React app, and with custom controls.

One goal has been to learn and use quite new technologies and patterns in the React and Javascript ecosystem. The following is studied, applied or planned applied:

* ✓ [Flow](https://flow.org) static typing.
* ✓ [Jest](https://jestjs.io/)/[Enzyme](https://airbnb.io/enzyme/) component and unit testing.
* ✓ [React context API](https://reactjs.org/docs/context.html). Current React version compliance.
* ✓ ES2018/ES2019 language features.
* ✓ NPM component library best practices. 
* ✓ [PostCSS](https://postcss.org/) and [Babel](https://babeljs.io/)-only builds, avoiding SASS and packager tools (e.g. Webpack).
* ✓ Automated code formatting with [Prettier](https://prettier.io/).
* ✓ Accessibility compliance through tab navigation in player controls and proper markup.
* ✓ [GitHub issues](https://github.com/vimond/replay/issues/).
* [Docz](https://docz.site) doc guides with live code examples displaying React components.
* Reference documentation generation based on Flow types.
* Full player tests with [Puppeteer](https://developers.google.com/web/tools/puppeteer/).
* CSS in JS approach to design and theming, with e.g. [emotion](https://emotion.sh/).
* Code splitting and dynamic imports (for VideoStreamer integrations including big third party libs).

Curiosity about the code, the technologies explored, and problems to be solved, are all welcome.

Except bug fixes, the project has a finite set of tasks to be done, all listed as [issues](https://github.com/vimond/replay/issues). Replay can be tested in [Streamlab through a feature toggle](https://streamlab.ops.vmp.vimondtv.com/?features=replay). Note that the latest changes are manually integrated.

For questions about this repo, contact [Tor Erik Alræk](mailto:torerik@vimond.com).