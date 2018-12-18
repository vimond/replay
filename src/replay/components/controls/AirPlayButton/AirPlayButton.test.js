import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import AirPlayButton from './AirPlayButton';

Enzyme.configure({ adapter: new Adapter() });

test('If AirPlay is available, <AirPlayButton/> renders with prefixed class name and DOM including children.', () => {
  const rendered = shallow(
    <AirPlayButton
      classNamePrefix="a-"
      airPlayActiveContent="A"
      airPlayInactiveContent="B"
      label="C"
      isAirPlayAvailable={true}
    />
  );
  const renderedToggleButton = rendered.dive();
  expect(rendered.name()).toBe('ToggleButton');
  expect(rendered.props().label).toBe('C');
  expect(renderedToggleButton.hasClass('a-airplay-button')).toBe(true);
  expect(renderedToggleButton.text()).toBe('B');

  const rendered2 = shallow(<AirPlayButton isAirPlayAvailable={true} />);
  const renderedToggleButton2 = rendered2.dive();
  expect(renderedToggleButton2.hasClass('replay-airplay-button')).toBe(true);
});

test('If AirPlay is unavailable, <AirPlayButton/> does not render.', () => {
  const rendered = shallow(
    <AirPlayButton classNamePrefix="a-" airPlayActiveContent="A" airPlayInactiveContent="B" label="C" />
  );
  expect(rendered.get(0)).toBeNull();
});

test('<AirPlayButton/> renders button state correctly while AirPlay assumingly is active.', () => {
  const rendered = shallow(
    <AirPlayButton
      classNamePrefix="a-"
      isAirPlayActive={true}
      airPlayActiveContent="A"
      airPlayInactiveContent="B"
      isAirPlayAvailable={true}
    />
  );
  const renderedToggleButton = rendered.dive();
  expect(rendered.props().isOn).toBe(true);
  expect(renderedToggleButton.text()).toBe('A');
});

test('<AirPlayButton/> updates property isAirPlayTargetPickerVisible with value true on click.', () => {
  const setPropertiesCallback = jest.fn();
  const rendered = shallow(
    <AirPlayButton
      setProperties={setPropertiesCallback}
      classNamePrefix="a-"
      isFullscreen={false}
      airPlayActiveContent="A"
      airPlayInactiveContent="B"
      isAirPlayAvailable={true}
    />
  );
  const renderedToggleButton = rendered.dive();
  renderedToggleButton.simulate('click');
  expect(setPropertiesCallback.mock.calls.length).toBe(1);
  expect(setPropertiesCallback.mock.calls[0][0]).toEqual({ isAirPlayTargetPickerVisible: true });
  expect(renderedToggleButton.simulate('click'));
  expect(setPropertiesCallback.mock.calls.length).toBe(2);
  expect(setPropertiesCallback.mock.calls[1][0]).toEqual({ isAirPlayTargetPickerVisible: true }); // Prop not updated. Same outcome.

  rendered.setProps({ isAirPlayActive: true }); // Shouldn't matter.
  const renderedToggle2 = rendered.dive();
  renderedToggle2.simulate('click');

  expect(setPropertiesCallback.mock.calls.length).toBe(3);
  expect(setPropertiesCallback.mock.calls[1][0]).toEqual({ isAirPlayTargetPickerVisible: true }); // Prop not updated. Same outcome.
});
