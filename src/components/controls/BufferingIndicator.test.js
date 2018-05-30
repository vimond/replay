import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import BufferingIndicator from './BufferingIndicator';

Enzyme.configure({ adapter: new Adapter() });

test('<BufferingIndicator/> with no inactive rendering mode renders when seeking, buffering or starting video.', () => {
  const rendered = [
    shallow(<BufferingIndicator content="B" label="Video is buffering" classNamePrefix="v-" playState="starting" isBuffering={false}/>),
    shallow(<BufferingIndicator content="B" label="Video is buffering" classNamePrefix="v-" playState="paused" isBuffering={true}/>),
    shallow(<BufferingIndicator content="B" label="Video is buffering" classNamePrefix="v-" playState="playing" isSeeking={true}/>),
    shallow(<BufferingIndicator content="B" label="Video is buffering" classNamePrefix="v-" playState="seeking" isSeeking={false}/>),
    shallow(<BufferingIndicator content="B" label="Video is buffering" classNamePrefix="v-" playState="buffering" isBuffering={false}/>)
  ];

  rendered.forEach(r => {
    expect(r.hasClass('v-buffering-indicator')).toBe(true);
    expect(r.hasClass('v-buffering')).toBe(true);
    expect(r.props().title).toBe('Video is buffering');
    expect(r.text()).toBe('B');
  });
});

test('<BufferingIndicator/> with no inactive rendering mode does not render when video is playing, paused, seeking, or not playing.', () => {
  const rendered = [
    shallow(<BufferingIndicator content="B" classNamePrefix="v-" playState="playing" />),
    shallow(<BufferingIndicator content="B" classNamePrefix="v-" playState="inactive" />),
    shallow(<BufferingIndicator content="B" classNamePrefix="v-" playState="paused" />)
  ];
  rendered.forEach(r => expect(r.getElement()).toBe(null))
});

test('<BufferingIndicator/> with inactive rendering mode does render when video is playing, paused, or not playing.', () => {
  const rendered = [
    shallow(<BufferingIndicator content="B" renderStrategy="always" classNamePrefix="v-" playState="playing" />),
    shallow(<BufferingIndicator content="B" renderStrategy="always" classNamePrefix="v-" playState="inactive" />),
    shallow(<BufferingIndicator content="B" renderStrategy="always" classNamePrefix="v-" playState="paused" />)
  ];
  rendered.forEach(r => {
    expect(r.hasClass('v-buffering-indicator')).toBe(true);
    expect(r.hasClass('v-buffering')).toBe(false);
    expect(r.props().title).toBeUndefined();
    expect(r.text()).toBe('B');
  });
});

test('<BufferingIndicator/> with inactive rendering mode renders when starting or buffering video, and indicates it by class name/title.', () => {
  const rendered = [
    shallow(<BufferingIndicator renderStrategy="always" content="B" label="Video is buffering" classNamePrefix="v-" playState="starting" isBuffering="false"/>),
    shallow(<BufferingIndicator renderStrategy="always" content="B" label="Video is buffering" classNamePrefix="v-" playState="paused" isBuffering="true"/>),
    shallow(<BufferingIndicator renderStrategy="always" content="B" label="Video is buffering" classNamePrefix="v-" playState="buffering" isBuffering="false"/>)
  ];
  rendered.forEach(r => {
    expect(r.hasClass('v-buffering-indicator')).toBe(true);
    expect(r.hasClass('v-buffering')).toBe(true);
    expect(r.props().title).toBe('Video is buffering');
    expect(r.text()).toBe('B');
  });
});