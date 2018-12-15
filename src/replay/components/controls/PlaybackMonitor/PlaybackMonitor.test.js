import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import PlaybackMonitor, { PropTableRow } from './PlaybackMonitor';
import ControllerContext from '../../player/PlayerController/ControllerContext';

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

const renderTree = (props, observe = () => {}) => {
  const mockContextValue = {
    inspect: () => mockVideoStreamState,
    observe,
    unobserve: () => {}
  };

  return (
    <div>
      <ControllerContext.Provider value={mockContextValue}>
        <PlaybackMonitor {...props} />
      </ControllerContext.Provider>
    </div>
  );
};

test('<PlaybackMonitor /> should render with table rows for each property, if configured to start visible.', () => {
  const tree = mount(renderTree(commonProps));
  const playbackMonitor = tree.find('PlaybackMonitor>div');
  expect(playbackMonitor.hasClass('v-playback-monitor')).toBe(true);
  expect(playbackMonitor.props().title).toBe('Playback monitor label');

  // Close button
  expect(playbackMonitor.find('Button').props().content).toEqual('X');
  expect(playbackMonitor.find('Button').props().label).toEqual('Close');
  expect(playbackMonitor.find('Button').props().className).toEqual('playback-monitor-close-button');
  expect(playbackMonitor.find('Button').props().classNamePrefix).toEqual('v-');
  expect(typeof playbackMonitor.find('Button').props().onClick).toEqual('function');

  // Table
  const table = playbackMonitor.find('table');
  expect(table.hasClass('v-playback-monitor-stream-state')).toBe(true);

  const tableRows = playbackMonitor.find('tbody').children();
  //.map(row => row.dive());
  expect(tableRows.length).toBe(23);
  const headerRow = tableRows.at(0).find('tr');
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
    const tr = row.find('tr');
    const td0 = tr.childAt(0);
    const td1 = tr.childAt(1);
    const td2 = tr.childAt(2);
    expect(td0.name()).toBe('th');
    expect(td1.name()).toBe('td');
    expect(td2.name()).toBe('td');
    const propertyName = td0.text();
    if (propertyName in mockVideoStreamState) {
      expect(td1.text()).toBe(expectedRenderedValues[propertyName]);
    } else {
      expect(td1.text()).toBe('');
    }
    expect(td2.text()).toBe('');
    expect(td0.hasClass('v-playback-monitor-property-name')).toBe(true);
    expect(td1.hasClass('v-playback-monitor-current-value')).toBe(true);
    expect(td2.hasClass('v-playback-monitor-previous-value')).toBe(true);
  });
});

test('<PlaybackMonitor /> should not render if not configured to start visible.', () => {
  const rendered = mount(<PlaybackMonitor {...commonProps} configuration={{}} />);
  expect(rendered.find('div').length).toBe(0);
});

test('<PlaybackMonitor /> should remove its rendering if the close button is pressed.', () => {
  const rendered = mount(<PlaybackMonitor {...commonProps} />);
  rendered.find('Button').simulate('click');
  rendered.update();
  expect(rendered.find('div').length).toBe(0);
});

test('<PlaybackMonitor /> should render if Ctrl+Alt+M is pressed.', () => {
  const rendered = mount(<PlaybackMonitor {...commonProps} configuration={null} />);
  expect(rendered.find('div').length).toBe(0);
  rendered.instance().handleKeyDown({ ctrlKey: true, altKey: true, code: 'KeyM' });
  rendered.update();
  const freshRendered = rendered.find('div').at(0);
  expect(freshRendered.name()).toEqual('div');
  expect(freshRendered.hasClass('v-playback-monitor')).toBe(true);
  expect(freshRendered.find('table').length).toBe(1);
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
      inspect={() => ({ myProp: 13 })}
      myOtherProp={true}
      propertyName="myProp"
      prefixedClassNames={{ propName: 'a', currentValue: 'b', previousValue: 'c' }}
    />
  );
  rendered.setProps({ myProp: '255' });
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
