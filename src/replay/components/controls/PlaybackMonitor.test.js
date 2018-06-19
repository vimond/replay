import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import PlaybackMonitor, { PropTableRow } from './PlaybackMonitor';
import { AvailableTrack, PlayMode, PlayState } from '../player/VideoStreamer/types';

Enzyme.configure({ adapter: new Adapter() });

const configuration = { playbackMonitor: { visibleAtStart: true } };

const mockTextTracks = [
  {
    kind: 'subtitles',
    label: 'Finnish subtitles',
    language: 'fi',
    origin: 'side-loaded'
  },
  {
    kind: 'subtitles',
    label: 'Swedish subtitles',
    language: 'sv',
    origin: 'side-loaded'
  }
];

const mockVideoStreamState = {
  isPaused: false,
  position: 313.1313,
  duration: 646,
  playMode: 'ondemand',
  playState: 'playing',
  absolutePosition: new Date('2018-05-28T20:03:42.336Z'),
  absoluteStartPosition: new Date('2018-05-28T19:00:00Z'),
  bitrates: [512, 960, 2048, 5222],
  error: new Error('DRM client unavailable'),
  currentTextTrack: null,
  textTracks: mockTextTracks
};

const updatedMockStreamState = {
  position: 424.2424,
  isPaused: true,
  currentBitrate: 960 // New one.
};

const expectedRenderedValues = {
  isPaused: 'false',
  position: '313.13',
  duration: '646',
  playMode: 'ondemand',
  playState: 'playing',
  absolutePosition: '2018-05-28T20:03:42.336Z',
  absoluteStartPosition: '2018-05-28T19:00:00.000Z',
  bitrates: '[512,960,2048,5222]',
  error: "{message: 'DRM client unavailable'}",
  currentTextTrack: '',
  textTracks: `[{kind:"subtitles",label:"Finnish subtitles",language:"fi",origin:"side-loaded"},{kind:"subtitles",label:"Swedish subtitles",language:"sv",origin:"side-loaded"}]`
};

const commonProps = {
  label: 'Playback monitor label',
  classNamePrefix: 'v-',
  closeButtonContent: 'X',
  videoStreamState: mockVideoStreamState,
  configuration
};

test('<PlaybackMonitor /> should render if configured to start visible.', () => {
  const rendered = shallow(<PlaybackMonitor {...commonProps} />);
  expect(rendered.name()).toEqual('div');
  expect(rendered.hasClass('v-playback-monitor')).toBe(true);
  expect(rendered.props().title).toBe('Playback monitor label');

  // Close button
  expect(rendered.find('Button').props().content).toEqual('X');
  expect(rendered.find('Button').props().label).toEqual('Close');
  expect(rendered.find('Button').props().className).toEqual('playback-monitor-close-button');
  expect(rendered.find('Button').props().classNamePrefix).toEqual('v-');
  expect(typeof rendered.find('Button').props().onClick).toEqual('function');

  // Table
  const table = rendered.find('table');
  expect(table.hasClass('v-playback-monitor-stream-state')).toBe(true);

  const tableRows = rendered
    .find('tbody')
    .children()
    .map(row => row.dive());
  expect(tableRows.length).toBe(23);
  const headerRow = tableRows[0];
  expect(headerRow.hasClass('v-playback-monitor-table-header')).toBe(true);
  const child0 = headerRow.childAt(0);
  const child1 = headerRow.childAt(1);
  const child2 = headerRow.childAt(2);
  expect(child0.name()).toBe('th');
  expect(child1.name()).toBe('th');
  expect(child2.name()).toBe('th');
  expect(child0.text()).toBe('Property name');
  expect(child1.text()).toBe('Current value');
  expect(child2.text()).toBe('Previous value');
  expect(child0.hasClass('v-playback-monitor-property-name')).toBe(true);
  expect(child1.hasClass('v-playback-monitor-current-value')).toBe(true);
  expect(child2.hasClass('v-playback-monitor-previous-value')).toBe(true);
  tableRows.slice(1).forEach(row => {
    const child0 = row.childAt(0);
    const child1 = row.childAt(1);
    const child2 = row.childAt(2);
    expect(child0.name()).toBe('th');
    expect(child1.name()).toBe('td');
    expect(child2.name()).toBe('td');
    const propertyName = child0.text();
    if (propertyName in mockVideoStreamState) {
      expect(child1.text()).toBe(expectedRenderedValues[propertyName]);
    } else {
      expect(child1.text()).toBe('');
    }
    expect(child2.text()).toBe('');
    expect(child0.hasClass('v-playback-monitor-property-name')).toBe(true);
    expect(child1.hasClass('v-playback-monitor-current-value')).toBe(true);
    expect(child2.hasClass('v-playback-monitor-previous-value')).toBe(true);
  });
});

test('<PlaybackMonitor /> should not render if not configured to start visible.', () => {
  const rendered = shallow(<PlaybackMonitor {...commonProps} configuration={{}} />);
  expect(rendered.getElement()).toBe(null);
});

test('<PlaybackMonitor /> should remove its rendering if the close button is pressed.', () => {
  const rendered = shallow(<PlaybackMonitor {...commonProps} />);
  rendered
    .find('Button')
    .dive()
    .simulate('click');
  rendered.update();
  expect(rendered.getElement()).toBe(null);
});

test('<PlaybackMonitor /> should render if Ctrl+Alt+V is pressed.', () => {
  const rendered = shallow(<PlaybackMonitor {...commonProps} configuration={null} />);
  expect(rendered.getElement()).toBe(null);
  rendered.instance().handleKeyDown({ ctrlKey: true, altKey: true, keyCode: 86 });
  rendered.update();
  expect(rendered.name()).toEqual('div');
  expect(rendered.hasClass('v-playback-monitor')).toBe(true);
  expect(rendered.find('table').length).toBe(1);
});

test.skip('<PlaybackMonitor /> should render one table row with state properties for each ordered property name.', () => {
  // Already covered in monstrous render test.
});

test.skip('<PlaybackMonitor /> should format different types of values appropriately.', () => {
  // This test is already covered in the full render test.
  const rendered = shallow(<PlaybackMonitor {...commonProps} />);
  const tbody = rendered.find('tbody');
  const tableRows = table.children().map(row => row.dive());
  test('Numbers are formatted with a few decimals.', () => {
    const numberRow = tableRows[5];
    expect(numberRow.childAt(1).text()).toBe('313.13');
  });
  test('Dates are formatted as readable UTC.', () => {});
  test('Booleans spell out true/false.', () => {});
  test('Arrays list items compactly.', () => {});
  test('Objects are represented with compact JSON.', () => {});
  test('Functions are output with mild shock and disbelief.', () => {});
  test('Strings are output without formatting.', () => {});
});

test('<PropTableRow/> should fill the previous value column when the observed property changes.', () => {
  const rendered = shallow(
    <PropTableRow
      videoStreamState={{ myProp: '13', myOtherProp: true }}
      propertyName="myProp"
      prefixedClassNames={{ propName: 'a', currentValue: 'b', previousValue: 'c' }}
    />
  );
  rendered.setProps({ videoStreamState: { myProp: '255' } });
  rendered.update();
  const currentValueCell = rendered.find('.b');
  const previousValueCell = rendered.find('.c');
  expect(currentValueCell.text()).toBe('255');
  expect(previousValueCell.text()).toBe('13');
});

test.skip('<PlaybackMonitor /> should detect properties having changed values, and display the previous value in a separate column.', () => {
  // Needs to research how to update the table row child components. Until then this test doesn't run properly.
  // Table row updates are tested in the previous test.
  const rendered = shallow(<PlaybackMonitor {...commonProps} />);

  const tbody = rendered.find('tbody');
  tbody.children().map(row => row.dive());
  rendered.setProps({ videoStreamState: updatedMockStreamState });
  rendered.update();

  const tableRows = tbody.children().map(row => row.dive());

  const isPausedRow = tableRows[3];
  const positionRow = tableRows[6];
  const currentBitrateRow = tableRows[12];

  expect(positionRow.childAt(0).text()).toBe('position');
  expect(positionRow.childAt(1).text()).toBe('424.24');
  expect(positionRow.childAt(2).text()).toBe('313.13');
  expect(isPausedRow.childAt(0).text()).toBe('isPaused');
  expect(isPausedRow.childAt(1).text()).toBe('true');
  expect(isPausedRow.childAt(2).text()).toBe('false');
  expect(currentBitrateRow.childAt(0).text()).toBe('currentBitrate');
  expect(currentBitrateRow.childAt(1).text()).toBe('960');
  expect(currentBitrateRow.childAt(2).text()).toBe('');
});
