import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderPlayerUI from './playerUI';

Enzyme.configure({ adapter: new Adapter() });

test('renderPlayerUI() renders and recognises the specified props.', () => {
  const renderParameters = {
    configuration: { 
      setting: 'value',
      ui: {
        skipButtonOffset: -20,
        qualitySelectionStrategy: 'cap-bitrate',
        liveDisplayMode: 'clock-time'
      }
    }, 
    externalProps: {
      onExit: jest.fn()
    }
  };
  const rendered = mount(renderPlayerUI(renderParameters));
  rendered.find('ExitButton').simulate('click');
  expect(renderParameters.externalProps.onExit.mock.calls.length).toBe(1);
  expect(rendered.find('SkipButton').prop('offset')).toBe(-20);
  expect(rendered.find('TimeDisplay').prop('liveDisplayMode')).toBe('clock-time');
  expect(rendered.find('QualitySelector').prop('selectionStrategy')).toBe('cap-bitrate');
  expect(rendered.find('PlaybackMonitor').prop('configuration')).toBe(renderParameters.configuration);
  
  expect(rendered).toMatchSnapshot();
});