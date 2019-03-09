# Replay

Replay is a **Re**act video **play**er with these key characteristics:
 
* Ready-to-use component.
* Custom and customisable player controls and UX.
* Enables adaptive streaming, thanks to [HLS.js](https://github.com/video-dev/hls.js) and [Shaka Player](https://github.com/google/shaka-player) integrations.
* One consistent and React-friendly API across all streaming technologies.

### Capabilities at a glance

* MPEG-DASH, HLS, progressive MP4/WebM playback.
* In-stream and side-loaded subtitles. Selector controls for subtitles and audio tracks.
* Common player controls: play/pause, volume, mute, timeline, skip back button, fullscreen.
* Live/DVR playback with timeshifting controls.
* Advanced player controls: Picture-in-picture, AirPlay, bitrate (quality) selector.
* Keyboard shortcuts and tab navigation.
* Remembering the user's volume and language preferences.
* Responsive player sizing and UI adaptation.
* Touch- and mobile-friendly UX.

[Full feature list](https://vimond.github.io/replay/#/#features-list)

## Getting started

### Prerequisites

Minimum React version for Replay is 16.6. Additionally, one component, the [video streamer resolver](/advanced-playback/adaptive-streaming#enabling-playback-for-multiple-streaming-technologies-based-on-stream-technology-resolution), requires your script bundler to support dynamic `import()` statements. This only applies if this component is actually inserted in your code.

### Inserting Replay into your React app

#### Installing the Replay npm package

```sh
npm install vimond-replay --save
```

#### Importing dependencies

```javascript
import React from 'react';
import { Replay } from 'vimond-replay';
import 'vimond-replay/index.css';
```

The last CSS `import` statement might be substituted with your desired CSS inclusion mechanism, e.g. SASS.

#### Rendering the Replay player with a progressive video source (MP4 file)

```jsx
class MyAppView extends React.Component {
  render() {
    return (
      <Replay source="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"/>
    );
  }
}
```

Flow and TypeScript static type annotations/declarations are provided for the Replay component.

### Next steps

* [More insert options](https://vimond.github.io/replay/#/advanced-playback/adaptive-streaming)
* [Playing DASH or HLS streams](https://vimond.github.io/replay/#/advanced-playback/adaptive-streaming)
* [Configuring Replay](https://vimond.github.io/replay/#/custom-replay/configuration)
* [Custom skins](https://vimond.github.io/replay/#/custom-replay/skins-styles)
* [Full documentation with live examples](https://vimond.github.io/replay/)

## Working with the source code

### Project setup

[Development setup](https://vimond.github.io/replay/)

### Technologies & patterns used & applied

* [Flow](https://flow.org) static type annotations.
* [Jest](https://jestjs.io/) and [Enzyme](https://airbnb.io/enzyme/) unit and component testing.
* Automated code formatting with [Prettier](https://prettier.io/).
* [ESlint](https://eslint.org/) code quality checks.
* [PostCSS](https://postcss.org/) and [Babel](https://babeljs.io/) for builds/transpilations.
* [Docz](https://docz.site) documentation authoring and generation with live code examples displaying React components.
* [React.lazy](https://reactjs.org/blog/2018/10/23/react-v-16-6.html) and dynamic imports for splitting out heavy third party streaming dependencies.
* [React context API](https://reactjs.org/docs/context.html).
* ES2018/ES2019 language features.

## About

Replay is an open source initiative from [Vimond Media Solutions](https://vimond.com).

### License

Replay is released under the [Apache 2.0 License](https://github.com/vimond/replay/blob/master/LICENSE).

### Roadmap

See the [project milestones](https://github.com/vimond/replay/milestones).

### Authors

Replay is developed by Tor Erik Alræk.


