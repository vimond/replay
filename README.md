# Replay

This is a personal training project coded outside office hours.

Replay is a **Re**act **play**er controls component library and a full player component, planned to be independent to Vimond environments and earlier projects.

It is also a **replay**cement (pun intended) for the legacy and non-React Vimond **Re**ference **Play**er currently used for testing streams in [Streamlab](http://streamlab.ops.vmp.vimondtv.com/). 

The player component allows for wrapping and plugging in advanced streaming and playback technologies as first-class React components. The goal is "thinking in React" as much as possible.

With a modular approach, all of Vimond's earlier playback technology integrations known as [vimond-uniplayer-videoengine](https://github.com/vimond/vimond-uniplayer-videoengine), including Silverlight and HLS/DASH player libraries, can be utilised with this player. This is a legacy approach to be replaced with some fresh components.

The Replay player also aims to "get the job done" when it comes to simply embedding a video file to be played in a React app, and with custom controls.

One goal has been to use quite new technologies and patterns in the React ecosystem. Curiosity about the code, the technologies explored, and problems to be solved, are all welcome.

Except bug fixes, the project has a finite set of tasks to be done, all listed as [issues](https://github.com/vimond/replay/issues). Replay can be tested in [Streamlab through a feature toggle](https://streamlab.ops.vmp.vimondtv.com/?features=replay). Note that the latest changes are manually integrated.

For questions about this repo, contact [Tor Erik Alræk](mailto:torerik@vimond.com).