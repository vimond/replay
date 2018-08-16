# Introduction: The challenges and requirements

## Defining the video player

The task of playing back video in a web page, is more or less handled by the browser through the HTML `<video>` element. However, requiring a custom player UI or sophisticated playback technologies, adding a video player to the page becomes a development concern, and we can't or won't just deal with the browser abstractions.

In the scope of this project, and quite commonly in frontend development, a (customised) video player in a web page is defined by a set of page elements: The element displaying/rendering the video stream (and all the inner mechanics behind this task), combined with element hierarchy constituting the player user interface, with controls, overlays, styling, and a layout. This becomes a branch of the page DOM tree looking a bit like its own ecosystem. Often, the video player should operate quite autonomously after being instantiated and told what to play.

The video player could be enriched with extra features for the end-user or behind-the-scenes, and it could be desired to keep these extensions as part of the subtree-scoped player ecosystem. Examples are REST API consumption, content recommendation overlays or menus, game events related to a sports live stream, video ad system integrations, or tracking/analytics integrations. 

This project is built with customisation and extensibility in mind for these purposes, however it only implements features covering the core playback tasks along with a core playback UX. It also aims to allow for advanced, multiple playback/streaming technologies with a consistent wrapping of, and plug-in approach to, existing implementations/libraries.

## The task of the video player UI: Consuming and controlling the video playback state

A video being played has a state with a lot of properties. Throughout playback, the state is set or changes because of 1) events coming from the stream and stream delivery itself, 2) the nature/lifecycle of video playback, and 3) as a result of outer manipulation of the playback state, from e.g. end users or external integrations.

Examples of 1):

* The bitrate changes adaptively because of varying 
* The stream appears to have several audio tracks
* A live stream increases its DVR window length

Examples of 2):

* Video starts or ends
* Playback position changes

Example of 3), operations leading to state changes.

* The user selects a subtitles track to be displayed.
* The user changes the playback position (seeks) through the timeline control
* A site-wide volume setting mutes the audio of the playback

## The multi-faceted and complex task of rendering and playing the video

When inserting a `<video>` element to a web page, today's browsers with some exceptions are only capable of playing a video file provided from a URL specified in the `src` attribute. The browsers don't handle the following concerns: Adaptive streaming achieving continuous playback adapting to varying bandwidth conditions. Live streaming with or without timeshifting, DRM (a concern only for premium content providers), multiple audio tracks, multiple subtitles formats.

For fulfilling these requirements, there are advanced streaming technologies, and for the browser, there are Javascript libraries that make the browser capable of playing streams with the advanced features. Examples are HLS.js, Dash.js, and Shaka Player.

# The main pattern and principles for Replay

A Replay player contains components with three main roles: 1) Player UI components (controls and player containment), 2) a video streamer component rendering/playing the video, abstracting technological or platform concerns, and 3) a player controller hub component connecting the video streamer with the player UI, plus managing it all.

## Consistently exposing and dealing with the state

The core principle of Replay is distilling the different state properties related to the video playback, and expose it to the full player UI element tree. At the same time, all controls and components can invoke actions manipulating some of the properties of playback. All this with as little boilerplate code, like `ref`-plumbing or [prop-drilling](https://blog.kentcdodds.com/prop-drilling-bb62e02cb691), as possible.

### A familiar React pattern exists

Passing down state across components, and invoking actions manipulating the state, is a well-known and central React pattern, and often implemented with Redux. Could playback state like play/pause mode, duration, available subtitle tracks, etc. be transferred and exposed in a Redux state slice? Could manipulating the player be Flux actions, setting volume, seeking, toggling pause?

Certainly, but it is not a good fit: A video player is most often only an autonomous component in a page or single-page-app, and the Redux state contains a lot of unrelated information most often concerning the full app state and data presented to the user or supplied by the user. This is similar to e.g. a complex form component like a combo-box. The expanded/collapsed state and filtering dropdown items based on entered characters, are examples of data that are not wise to manage in Redux and with Flux actions.

Further, Redux state works best with "singletons" in a page. Contrary, quite common use-cases for a video player component could imply inserting more than instance in a page, and the state should not be mixed between them.

### Just passing props and callbacks?

For simple/flat player UI trees this could be useful. Still the state and playback API needs to be "lifted up" from the video streamer component so it can be exposed downwards to player UI components, and significant amounts of "plumbing" is needed. Besides, it is hard to design this with optimal performance in mind. Every time the playback position is updated, the prop set is changed, and from the top of the player UI tree, a rerender will be required down to the components actually consuming the playback position. This does have a performance impact.

## The player controller and its perfect React fit

The Context API, introduced with React 16.3, is on the other hand a good fit. It makes it easy to share and scope state in a branch/part of the rendered React element tree. Any player instance will keep data private between instances, other parts of the React app don't need to deal with playback state (unless it is desired). The player becomes an isolated component abstracting its inner concerns.

Any components within the player subtree dependent on playback state and/or controlling the playback can consume a React player context. The hub component providing the context is the player controller. As the video rendering component is also located somewhere deep down in the player UI component tree, the player controller also uses the context to pass down the video streamer element to its desired UI tree location.

Further, using the context means not passing down playback state props through the player UI render tree to components consuming them. This eliminates the full subtree rerender requirement. Each component individually can subscribe to specific props and only get updated when those props update.

The player controller hosts the player UI and the video streamer, and also manages configuration.

## Summary of the playback state properties and actions/operations that can be performed with Replay and its VideoStreamer 

### Playback state

* Current playback position and duration of the stream or video file. For live streams also clock time for a stream position.
* Play state: Is the stream paused, has it ended, is it buffering, is a seeking operation going on?
* Stream mode: On demand, live, timeshifting availability.
* Current bitrate and available qualities for a stream.
* Buffer level.
* Currently displayed subtitles (if any) and available subtitles (typically different language options).
* Current audio track playing and all available audio tracks (typically different language options).
* Volume level and mute state.

### Playback operations

* Seek to a different stream position or timeshift or resume from live edge in a live stream.
* Pause/play toggle.
* Override adaptive bitrate selection with a specific quality setting or capping the quality selection.
* Select subtitles or switch audio tracks.
* Adjust the volume or mute/unmute the playback.
* Specifying what to play: Stream URLs, subtitles URLs, and associated technical details.

# Design and architecture

## Tools and coding practices

### Flow

Component prop types are specified with Flow. And more importantly, the video streamer API is defined with Flow types. This is essential to understanding how controls should operate on the video playback, and for creating different VideoStreamer components wrapping different playback technologies.

### Other quality tools

Jest/Enzyme unit and component testing, Prettier/ESLint.

## UI: No-nonsense React components

### Controls

#### Generic components and specialised player controls




#### A common control API pattern

* Props with names matching one or several playback state properties related to the control purpose.
* Callback prop updateProperty or setPosition/gotoLive.
* Appearance props for control content (graphics, text) and styling/class names.
* In some cases, simple configuration props for alternative control behaviour/appearance

#### Connected controls

The controls are on its own not connected to the video streamer. Through a higher order component (HOC), all Replay controls are connected to the player context. Custom controls can also get connected by applying the same higher order component, [`ConnectControl`](api.md#ConnectControl).

What playback state properties a component is consuming, is specified when applying the HOC. This ensures that the rendered component is only updated when the desired properties are changed. This prevents frequent updates coming mainly from playback position updates.

### Other player UI tasks (containment helpers)

## VideoStreamer: Consistency, completion, first-class React

The idea is that any streaming/playback technology wrapped in a video streamer component should expose all of this consistently, as long as the feature is supported. 

The video element is behaving differently across browsers. It has a not so well-designed API, exposing state changes inconsistently through a big number of events. 

#### VideoStreamer API and expected behaviour

## PlayerController, and assembling all parts into a full player

#### Using the composer helper

#### Simply defining a player component wiring up all parts



