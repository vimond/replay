import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import TimeDisplay from './TimeDisplay';
import { getUtcTime } from '../../common.test';

Enzyme.configure({ adapter: new Adapter() });

const renderTimeDisplay = ({
  playMode,
  position,
  duration,
  absolutePosition,
  liveDisplayMode = 'clockTime',
  classNamePrefix = 'a-',
  label = 'Playback time',
  positionLabel = 'Position',
  durationLabel = 'Duration',
  clockTimeLabel = 'Time'
}) => {
  return shallow(
    <TimeDisplay
      classNamePrefix={classNamePrefix}
      liveDisplayMode={liveDisplayMode}
      negativeMark="–"
      playMode={playMode}
      absolutePosition={absolutePosition}
      position={position}
      duration={duration}
      label={label}
      positionLabel={positionLabel}
      durationLabel={durationLabel}
      clockTimeLabel={clockTimeLabel}
    />
  );
};

test('<TimeDisplay/> renders with prefixed class name and DOM including children for position and duration.', () => {
  const rendered = renderTimeDisplay({ position: 0, duration: 123, playMode: 'ondemand' });
  expect(rendered.prop('title')).toBe('Playback time');
  expect(rendered.hasClass('a-time-display')).toBe(true);
  const positionElement = rendered.find('.a-time-display-position');
  const durationElement = rendered.find('.a-time-display-duration');
  const clockTimeElement = rendered.find('.a-time-display-clock-time');
  expect(clockTimeElement.length).toBe(0);
  expect(positionElement.name()).toBe('span');
  expect(durationElement.name()).toBe('span');
  expect(positionElement.text()).toBe('00:00');
  expect(durationElement.text()).toBe('02:03');
  expect(positionElement.prop('title')).toBe('Position');
  expect(durationElement.prop('title')).toBe('Duration');
});

test('<TimeDisplay/> in on demand mode formats negative positions or durations as 00:00.', () => {
  const rendered = renderTimeDisplay({ position: -13.44, duration: 123, playMode: 'ondemand' });
  const positionElement = rendered.find('.a-time-display-position');
  expect(positionElement.text()).toBe('00:00');
});

test(
  '<TimeDisplay/> with clock time mode displays no duration, but a time of day including hours, ' +
    'minutes, and seconds, for live streams with valid time stamps.',
  () => {
    const rendered = renderTimeDisplay({
      position: 13,
      duration: 123,
      playMode: 'livedvr',
      liveDisplayMode: 'clock-time',
      absolutePosition: new Date('2018-04-23T20:56:12.123Z')
    });
    const positionElement = rendered.find('.a-time-display-position');
    const durationElement = rendered.find('.a-time-display-duration');
    const clockTimeElement = rendered.find('.a-time-display-clock-time');
    expect(positionElement.length).toBe(0);
    expect(durationElement.length).toBe(0);
    expect(getUtcTime(2018, 4, 23, clockTimeElement.text())).toBe('20:56:12');
  }
);

test(
  '<TimeDisplay/> with live offset mode, or without valid time stamps, displays duration and ' +
    'offset/timeshift from live position, including hours, minutes, and seconds.',
  () => {
    const rendered1 = renderTimeDisplay({
      position: 13,
      duration: 123,
      playMode: 'livedvr',
      liveDisplayMode: 'live-offset',
      absolutePosition: new Date('2018-04-23T20:56:12.123Z')
    });
    const positionElement = rendered1.find('.a-time-display-position');
    const durationElement = rendered1.find('.a-time-display-duration');
    expect(positionElement.text()).toBe('–01:50');
    expect(durationElement.text()).toBe('02:03');
    const rendered2 = renderTimeDisplay({
      position: 100,
      duration: 123,
      playMode: 'livedvr',
      liveDisplayMode: 'clock-time',
      absolutePosition: new Date(NaN)
    });
    const positionElement2 = rendered2.find('.a-time-display-position');
    const durationElement2 = rendered2.find('.a-time-display-duration');
    expect(positionElement2.text()).toBe('–00:23');
    expect(durationElement2.text()).toBe('02:03');
  }
);

test('<TimeDisplay/> with live offset mode, and play mode live, attempts displaying position as clock time, but falls back to relative position again..', () => {
  const rendered = renderTimeDisplay({
    position: 13,
    duration: 123,
    playMode: 'live',
    liveDisplayMode: 'live-offset',
    absolutePosition: new Date('2018-04-23T20:56:12.123Z')
  });
  const positionElement = rendered.find('.a-time-display-position');
  const durationElement = rendered.find('.a-time-display-duration');
  const clockTimeElement = rendered.find('.a-time-display-clock-time');
  expect(positionElement.length).toBe(0);
  expect(durationElement.length).toBe(0);
  expect(getUtcTime(2018, 4, 23, clockTimeElement.text())).toBe('20:56:12');
  const rendered2 = renderTimeDisplay({
    position: 123,
    duration: 123,
    playMode: 'live',
    liveDisplayMode: 'live-offset',
    absolutePosition: null
  });
  const positionElement2 = rendered2.find('.a-time-display-position');
  const durationElement2 = rendered2.find('.a-time-display-duration');
  const clockTimeElement2 = rendered2.find('.a-time-display-clock-time');
  expect(clockTimeElement2.length).toBe(0);
  expect(durationElement2.length).toBe(0);
  expect(positionElement2.text()).toBe('00:00');
});

test('<TimeDisplay/> renders 00:00 on falsy/invalid positions.', () => {
  const renderedList = [
    renderTimeDisplay({
      position: NaN,
      duration: 123,
      playMode: 'livedvr',
      liveDisplayMode: 'live-offset',
      absolutePosition: new Date('2018-04-23T20:56:12.123Z')
    }),
    renderTimeDisplay({
      position: false,
      duration: 123,
      playMode: 'ondemand',
      liveDisplayMode: 'live-offset',
      absolutePosition: new Date('2018-04-23T20:56:12.123Z')
    }),
    renderTimeDisplay({
      position: Infinity,
      duration: 123,
      playMode: 'ondemand',
      liveDisplayMode: 'live-offset',
      absolutePosition: new Date('2018-04-23T20:56:12.123Z')
    }),
    renderTimeDisplay({
      position: {},
      duration: 123,
      playMode: 'ondemand',
      liveDisplayMode: 'live-offset',
      absolutePosition: new Date('2018-04-23T20:56:12.123Z')
    })
  ];
  expect(
    renderedList.map(rendered => rendered.find('.a-time-display-position')).filter(p => p.text() === '00:00').length
  ).toBe(4);
});

test('<TimeDisplay/> renders 00:00 on falsy/invalid durations.', () => {
  const renderedList = [
    renderTimeDisplay({
      position: 234,
      duration: NaN,
      playMode: 'livedvr',
      liveDisplayMode: 'live-offset',
      absolutePosition: new Date('2018-04-23T20:56:12.123Z')
    }),
    renderTimeDisplay({
      position: 234,
      duration: false,
      playMode: 'ondemand',
      liveDisplayMode: 'live-offset',
      absolutePosition: new Date('2018-04-23T20:56:12.123Z')
    }),
    renderTimeDisplay({
      position: 234,
      duration: Infinity,
      playMode: 'ondemand',
      liveDisplayMode: 'live-offset',
      absolutePosition: new Date('2018-04-23T20:56:12.123Z')
    }),
    renderTimeDisplay({
      position: 234,
      duration: -45,
      playMode: 'ondemand',
      liveDisplayMode: 'live-offset',
      absolutePosition: new Date('2018-04-23T20:56:12.123Z')
    })
  ];
  expect(
    renderedList.map(rendered => rendered.find('.a-time-display-duration')).filter(p => p.text() === '00:00').length
  ).toBe(4);
});

test(
  '<TimeDisplay/> adds a class name indicating that only position is to be displayed, ' +
    'when clock time mode enabled or with live mode.',
  () => {
    const rendered = renderTimeDisplay({
      position: 13,
      duration: 123,
      playMode: 'live',
      liveDisplayMode: 'live-offset',
      absolutePosition: new Date('2018-04-23T20:56:12.123Z')
    });
    expect(rendered.hasClass('a-time-display-no-duration')).toBe(true);
    const rendered2 = renderTimeDisplay({
      position: 13,
      duration: 123,
      playMode: 'livedvr',
      liveDisplayMode: 'clock-time',
      absolutePosition: new Date('2018-04-23T20:56:12.123Z')
    });
    expect(rendered2.hasClass('a-time-display-no-duration')).toBe(true);
  }
);
