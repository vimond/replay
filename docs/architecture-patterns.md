
# Architecture and patterns

## The holy trinity

TODO: Insert nice diagram

### Video streamer

The video streamer is a React component comparable to the HTML video element, but wrapped into a nicer and more consistent and predictable API. Several video streamer implementations can be provided, with the possibility of wrapping more advanced playback technologies.

Along with the Replay library comes a `<BasicVideoStreamer/>` component wrapping the HTML video element. This is included implicitly by the Replay player unless another one is specified.

All video streamer components should implement the same API interface, and behave identically when playing a video or stream, as long as the underlying playback technology allows for it. This makes the video streamer components interchangeable within the same Replay player setup, and controls/UI will behave as expected by the end user.

Mainly, the video streamer API can be divided into three concerns:

* Specifying what to play.
* Manipulating the playback, e.g. by pausing, seeking, changing volume, or selecting text tracks for display.
* Allowing for observation of the playback state. The observers will get updated on state properties when they change.

See the API reference (TODO: link).

### Player controller

### Connected player controls

#### Generic components and specialised player controls

The core building blocks are a few generic components: `<Button/>`, `<ToggleButton/>`, `<Selector/>`, `<Slider/>`, and `<Container/>`.

From this, dedicated player controls are built.

#### A common control API pattern

* Props with names matching one or several playback state properties related to the control purpose.
* Callback prop updateProperty or setPosition/gotoLive.
* Appearance props for control content (graphics, text) and styling/class names.
* In some cases, simple configuration props for alternative control behaviour/appearance

#### Connected controls

The controls are on its own not connected to the video streamer. Through a higher order component (HOC), all Replay controls are connected to the player context. Custom controls can also get connected by applying the same higher order component, [`ConnectControl`](api.md#ConnectControl).

What playback state properties a component is consuming, is specified when applying the HOC. This ensures that the rendered component is only updated when the desired properties are changed. This prevents frequent updates coming mainly from playback position updates.

## Technologies and tools used in this project

As mentioned in the [background article](background), using modern React-related patterns is one mean to fulfill the goals of this player project. That includes the following:

* Statical [Flow typing](https://flow.org).
* [Jest](https://jestjs.io/)/[Enzyme](https://airbnb.io/enzyme/) tests.
* React [context API](https://reactjs.org/docs/context.html).
* Code formatting with [Prettier](https://prettier.io/), linting with [ESLint](https://eslint.org/).
* [x0](https://compositor.io/x0/) documentation with live editing and rendering of components. Unfortunately not mature enough.
* [Yarn](https://yarnpkg.com/) is used instead of `npm`.
* [Babel](https://babeljs.io/) and [PostCSS](https://postcss.org/).

Some design principles on top of this:

* Utilising common ES2019 language features.
* Performant UI, avoiding updates to the full element UI tree when any property changes.
* Reduce code bloat for npm package users, only including code parts and assets being required.
* Avoid using React APIs subject to deprecation, e.g. `componentWillReceiveProps()`.

API docs are yet to be decided upon. Tools for automatic generation based on Flow types are not good enough yet.

TOOD: Draft. Remove.

## Summary of the playback state properties and actions/operations that can be performed with Replay and its VideoStreamer 




