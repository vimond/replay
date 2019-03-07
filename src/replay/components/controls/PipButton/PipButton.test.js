import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import PipButton from './PipButton';

Enzyme.configure({ adapter: new Adapter() });

test('If PiP is available, <PipButton/> renders with prefixed class name and DOM including children.', () => {
  const rendered = shallow(
    <PipButton classNamePrefix="a-" pipActiveContent="A" pipInactiveContent="B" label="C" isPipAvailable={true} />
  );
  const renderedToggleButton = rendered.dive();
  expect(rendered.name()).toBe('ToggleButton');
  expect(rendered.props().label).toBe('C');
  expect(renderedToggleButton.hasClass('a-pip-button')).toBe(true);
  expect(renderedToggleButton.text()).toBe('B');

  const rendered2 = shallow(<PipButton isPipAvailable={true} />);
  const renderedToggleButton2 = rendered2.dive();
  expect(renderedToggleButton2.hasClass('replay-pip-button')).toBe(true);
});

test('If PiP is unavailable, <PipButton/> does not render.', () => {
  const rendered = shallow(<PipButton classNamePrefix="a-" pipActiveContent="A" pipInactiveContent="B" label="C" />);
  expect(rendered.get(0)).toBeNull();
});

test('<PipButton/> renders button state correctly while picture-in-picture is active.', () => {
  const rendered = shallow(
    <PipButton
      classNamePrefix="a-"
      isPipActive={true}
      pipActiveContent="A"
      pipInactiveContent="B"
      isPipAvailable={true}
    />
  );
  const renderedToggleButton = rendered.dive();
  expect(rendered.props().isOn).toBe(true);
  expect(renderedToggleButton.text()).toBe('A');
});

test('<PipButton/> updates property isPipActive with opposite boolean value on click.', () => {
  const setPropertiesCallback = jest.fn();
  const rendered = shallow(
    <PipButton
      setProperties={setPropertiesCallback}
      classNamePrefix="a-"
      isFullscreen={false}
      pipActiveContent="A"
      pipInactiveContent="B"
      isPipAvailable={true}
    />
  );
  const renderedToggleButton = rendered.dive();
  renderedToggleButton.simulate('click');
  expect(setPropertiesCallback.mock.calls.length).toBe(1);
  expect(setPropertiesCallback.mock.calls[0][0]).toEqual({ isPipActive: true });
  expect(renderedToggleButton.simulate('click'));
  expect(setPropertiesCallback.mock.calls.length).toBe(2);
  expect(setPropertiesCallback.mock.calls[1][0]).toEqual({ isPipActive: true }); // Prop not updated. Same outcome.

  rendered.setProps({ isPipActive: true });
  const renderedToggle2 = rendered.dive();
  renderedToggle2.simulate('click');

  expect(setPropertiesCallback.mock.calls.length).toBe(3);
  expect(setPropertiesCallback.mock.calls[2][0]).toEqual({ isPipActive: false });
});
