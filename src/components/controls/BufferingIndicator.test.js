import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import BufferingIndicator from './BufferingIndicator';

Enzyme.configure({ adapter: new Adapter() });

test('<BufferingIndicator/> renders when buffering or starting video.', () => {
  const rendered = [
    shallow(<BufferingIndicator content="B" label="Video is buffering" classNamePrefix="v-" playState="starting" isBuffering="false"/>),
    shallow(<BufferingIndicator content="B" label="Video is buffering" classNamePrefix="v-" playState="paused" isBuffering="true"/>),
    shallow(<BufferingIndicator content="B" label="Video is buffering" classNamePrefix="v-" playState="buffering" isBuffering="false"/>)
  ];

  rendered.forEach(r => {
    expect(r.hasClass('v-buffering-indicator')).toBe(true);
    expect(r.props().title).toBe('Video is buffering');
    expect(r.text()).toBe('B');
  });
});

test('<BufferingIndicator/> does not render when video is playing, paused, seeking, or not playing.', () => {
  const rendered = [
    shallow(<BufferingIndicator classNamePrefix="v-" playState="seeking" />),
    shallow(<BufferingIndicator classNamePrefix="v-" playState="playing" />),
    shallow(<BufferingIndicator classNamePrefix="v-" playState="inactive" />),
    shallow(<BufferingIndicator classNamePrefix="v-" playState="paused" />)
  ];
  rendered.forEach(r => expect(r.getElement()).toBe(null))
});