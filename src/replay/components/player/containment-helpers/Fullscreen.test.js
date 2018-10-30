import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Fullscreen from './Fullscreen';
import {
  getFullscreenElement,
  notifyFullscreenChange,
  enterFullscreen as moduleEnterFullscreen,
  exitFullscreen as moduleExitFullscreen
} from './ponyfills/crossBrowserFullscreen';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('./ponyfills/crossBrowserFullscreen');

const renderShallow = () => {
  const renderFn = jest.fn();
  renderFn.mockReturnValue('Inner content');
  const rendered = shallow(<Fullscreen render={renderFn} />);
  const renderParameters = renderFn.mock.calls[0][0];
  return {
    rendered,
    renderFn,
    renderParameters
  };
};

test('<Fullscreen /> renders and invokes render prop.', () => {
  const { rendered, renderFn, renderParameters } = renderShallow();
  const { isFullscreen } = renderParameters;
  expect(rendered.text()).toBe('Inner content');
  expect(renderFn.mock.calls.length).toBe(1);
  expect(isFullscreen).toBe(false);
});

test("<Fullscreen /> updates the isFullscreen when the document's fullscreen element changes, and matches the one rendered.", () => {
  const { renderParameters, rendered } = renderShallow();
  const { onRef } = renderParameters;
  const onFullscreenChange = notifyFullscreenChange.mock.calls[0][0];

  const anElement = { id: 'a' };
  const anotherElement = { id: 'b' };

  getFullscreenElement.mockReturnValue(anElement);
  onRef(anElement);

  onFullscreenChange();
  rendered.update();
  expect(rendered.state('isFullscreen')).toBe(true);

  getFullscreenElement.mockReturnValue(anotherElement);
  onRef(anElement);
  onFullscreenChange();
  rendered.update();
  expect(rendered.state('isFullscreen')).toBe(false);

  getFullscreenElement.mockReturnValue(null);
  onRef(anElement);
  onFullscreenChange();
  rendered.update();
  expect(rendered.state('isFullscreen')).toBe(false);
});

test('<Fullscreen /> invokes enterFullscreen and exitFullscreen on the referred element.', () => {
  const { renderParameters } = renderShallow();
  const { onRef, enterFullscreen, exitFullscreen, setProperties } = renderParameters;

  const anElement = { id: 'c' };
  onRef(anElement);

  enterFullscreen();
  expect(moduleEnterFullscreen.mock.calls[0][0]).toBe(anElement);

  exitFullscreen();
  expect(moduleExitFullscreen.mock.calls[0][0]).toBe(anElement);

  setProperties({ isFullscreen: true });
  expect(moduleEnterFullscreen.mock.calls[1][0]).toBe(anElement);

  setProperties({ isFullscreen: false });
  expect(moduleExitFullscreen.mock.calls[1][0]).toBe(anElement);
});
