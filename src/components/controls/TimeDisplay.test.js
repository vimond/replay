import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import TimeDisplay from './TimeDisplay';

Enzyme.configure({ adapter: new Adapter() });

const numbers = {
	small: 34.56,
	normal: 123.45,
	big: 4567.89, // More than one hour
	extraBig: 87654.321, // More than one day 
	negative: -234.56,
	invalid1: NaN,
	invalid2: undefined,
	invalid3: Infinity,
	invalid4: ''
};

const dates = {
	valid: new Date('2018-04-23T20:56:12.123Z'),
	invalid1: new Date(NaN),
	invalid2: new Date(7200000), // Midnight in an obscure time zone.
	invalid3: new Date(Infinity),
	invalid4: undefined
};

const renderTimeDisplay = ({ playMode, position, duration, absolutePosition, liveDisplayMode="clockTime", classNamePrefix="a-", label="Playback time", positionLabel="Position", durationLabel="Duration", clockTimeLabel="Time" }) => {
	return shallow(
		<TimeDisplay 
			classNamePrefix={classNamePrefix}
			liveDisplayMode={liveDisplayMode}
			playMode={playMode}
			absolutePosition={absolutePosition}
			position={position}
			duration={duration}
			label={label}
			positionLabel={positionLabel}
			durationLabel={durationLabel}
			clockTimeLabel={clockTimeLabel}
		/>);
};

test('TimeDisplay renders with prefixed class name and DOM including children for position and duration.', () => {
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

test('TimeDisplay in on demand mode formats negative positions or durations as 00:00.', () => {
	
});

test('TimeDisplay with clock time mode displays no duration, but a time of day including hours, minutes, and seconds, for live streams with valid time stamps.', () => {});

test('TimeDisplay with live offset mode or without valid time stamps displays duration and offset/timeshift from live position, including hours, minutes, and seconds.', () => {});

test('TimeDisplay with live offset mode, and play mode live, attempts displaying position as clock time.', () => {});

test('TimeDisplay renders 00:00 on falsy positions, and no duration element on falsy duration.', () => {});

test('TimeDisplay adds a class name indicating that only position is to be displayed, when no valid duration or when clock time mode enabled.', () => {});
