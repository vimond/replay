# Background: The challenges and requirements

## Defining the video player

The task of playing back video in a web page, is more or less handled by the browser through the HTML `<video>` element. However, requiring a custom player UI or sophisticated playback technologies, adding a video player to the page becomes a development concern, and we can't or won't just deal with the browser abstractions.

In the scope of this project, and quite commonly in frontend development, a (customised) video player in a web page is defined by a set of page elements: The element displaying/rendering the video stream (and all the inner mechanics behind this task), combined with element hierarchy constituting the player user interface, with controls, overlays, styling, and a layout. This becomes a branch of the page DOM tree looking a bit like its own ecosystem. Often, the video player should operate quite autonomously after being instantiated and told what to play.

The video player could be enriched with extra features for the end-user or behind-the-scenes, and it could be desired to keep these extensions as part of the subtree-scoped player ecosystem. Examples are REST API consumption, content recommendation overlays or menus, game events related to a sports live stream, video ad system integrations, or tracking/analytics integrations.

## Goals of this player project

This project is built with customisation and extensibility in mind for these purposes, however at this time it only implements features covering the core playback tasks along with a core playback UX. It also prepares to allow for advanced, multiple playback/streaming technologies with a consistent wrapping of, and plug-in approach to, existing implementations/libraries. The same wrapping might also be used to plug in embed playback from e.g. YouTube or Vimeo in the same consistent wrapping, but the roots of this project are professional streaming requirements from independent services.

Part of reaching these goal is extensively adopting modern React patterns giving structure, clarity, and predictability to the running player code. Core video playback in the browser unfortunately gives a lot of surprises and inconsistencies to a player developer (example: *Why is the HTML video element state in some browsers "paused" when seeking to a different position?*). One goal is to express the observed playback state to observers, like player controls, in a clean manner. This is different to several other React video player alternatives out there.

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

## Discarded implementation alternatives

### The familiar React pattern

Passing down state across components, and invoking actions manipulating the state, is a well-known and central React pattern, and often implemented with Redux. Could playback state like play/pause mode, duration, available subtitle tracks, etc. be transferred and exposed in a Redux state slice? Could manipulating the player be Flux actions, setting volume, seeking, toggling pause?

Certainly, but it is not a good fit: A video player is most often only an autonomous component in a page or single-page-app, and the Redux state contains a lot of unrelated information most often concerning the full app state and data presented to the user or supplied by the user. This is similar to e.g. a complex form component like a combo-box. The expanded/collapsed state and filtering dropdown items based on entered characters, are examples of data that are not wise to manage in Redux and with Flux actions.

Further, Redux state works best with "singletons" in a page. Contrary, quite common use-cases for a video player component could imply inserting more than instance in a page, and the state should not be mixed between them.

### Just passing props and callbacks?

For simple/flat player UI trees this could be useful. Still the state and playback API needs to be "lifted up" from the video streamer component so it can be exposed downwards to player UI components, and significant amounts of "plumbing" is needed. Besides, it is hard to design this with optimal performance in mind. Every time the playback position is updated, the prop set is changed, and from the top of the player UI tree, a rerender will be required down to the components actually consuming the playback position. This does have a performance impact.

## The player controller and its React fit

The Context API, introduced with React 16.3, is on the other hand a good fit. It makes it easy to share and scope state in a branch/part of the rendered React element tree. Any player instance will keep data private between instances, other parts of the React app don't need to deal with playback state (unless it is desired). The player becomes an isolated component abstracting its inner concerns.

Any components within the player subtree dependent on playback state and/or controlling the playback can consume a React player context. The hub component providing the context is the player controller. As the video rendering component is also located somewhere deep down in the player UI component tree, the player controller also uses the context to pass down the video streamer element to its desired UI tree location.

Further, using the context means not passing down playback state props through the player UI render tree to components consuming them. This eliminates the full subtree rerender requirement. Each component individually can subscribe to specific props and only get updated when those props update.

The player controller hosts the player UI and the video streamer, and also manages configuration.



