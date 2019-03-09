---
name: Bug report
about: Report a problem with Replay
title: '[BUG] '
labels: 'bug'

---

**Is the problem actually a Replay bug?**

Replay facilitates stream playback with different technologies. However, for this it mainly relies on native browser features and/or third party libraries.

Bug reports that in reality appear to be requests for troubleshooting playback issues with specific streams, will mainly be rejected.

Before considering submitting a bug report, please get an understanding of whether the experienced issue is in fact a Replay bug, or if it is related to the stream or underlying third party player libraries.

Specifically, if the issue is about suboptimal or failing stream playback, identify the underlying playback technology being used in your case. If it is an adaptive stream, test if the issue is also reproducible with e.g. the demo players for HLS.js or Shaka Player:

 https://hls-js.netlify.com/demo
 http://shaka-player-demo.appspot.com/

If none of these are used, test the video URL with a raw <video> element inserted to your React app. If the issue is also present in these cases, then refrain from submitting a Replay bug report.

**Describe the bug**

A clear and concise description of what the bug is.

**To Reproduce**

Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**

A clear and concise description of what you expected to happen.

**Screenshots**

If applicable, add screenshots to hselp explain your problem.

**Desktop (please complete the following information):**

 - OS: [e.g. iOS]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]

**Smartphone (please complete the following information):**

 - Device: [e.g. iPhone6]
 - OS: [e.g. iOS8.1]
 - Browser [e.g. stock browser, safari]
 - Version [e.g. 22]

**Additional context**

 - React version.
 - Video/stream URL, characteristics (e.g. DVR, subtitles) and stream technologies (DASH, HLS) related to the problem.
 - Add any other context about the problem here.
