import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ResponsiveClassNames from './ResponsiveClassNames';
Enzyme.configure({ adapter: new Adapter() });

const setup = (config, elmRef = {}) => {
  const render = jest.fn();
  const rendered = shallow(<ResponsiveClassNames render={render} configuration={config} />);
  const { onRef, responsiveClassNames } = render.mock.calls[0][0];
  onRef({ mockElement: true });
  const returnValue = {
    rendered,
    instance: rendered.instance(),
    responsiveClassNames,
    resizeObserver: rendered.instance().resizeObserver,
    render,
    onRef
  };
  return returnValue;
};

const getLatestClassNames = render => render.mock.calls[render.mock.calls.length - 1][0].responsiveClassNames;

const config1 = {
  responsivenessRules: [{ className: 'large', width: { min: 1024 } }]
};
const config2 = {
  responsivenessRules: [{ className: 'small', width: { max: 640 }, height: { max: 360 } }]
};
const config3 = {
  responsivenessRules: [{ className: 'medium', width: { min: 640, max: 1024 } }]
};
const config4 = {
  responsivenessRules: [
    { className: 'wide', width: { min: 750, max: 1024 } },
    { className: 'big', width: { min: 850 }, height: { min: 600 } }
  ]
};

const entries1 = [{ contentRect: { top: 13, left: 13, width: 1030, height: 123 } }];
const entries2 = [{ contentRect: { top: 13, left: 13, width: 567, height: 123 } }];
const entries3 = [{ contentRect: { top: 13, left: 13, width: 789, height: 678 } }];
const entries4 = [{ contentRect: { top: 13, left: 13, width: 876, height: 678 } }];

test('<ResponsiveClassNames/> observes when an element and rules are provided.', () => {
  const { instance } = setup(config1);
  expect(instance.resizeObserver).toBeDefined();
});

test('<ResponsiveClassNames/> does not observe resizing if no rules are provided.', () => {
  const { instance } = setup();
  expect(instance.resizeObserver).toBeUndefined();
});

test(
  '<ResponsiveClassNames/> unobserves after an element is no longer provided, ' +
    'and reobserves when new element is provided.',
  () => {
    const { resizeObserver, onRef } = setup(config1);
    onRef(null);
    expect(resizeObserver.disconnect).toHaveBeenCalled();
    const freshElm = { freshElement: true };
    onRef(freshElm);
    expect(resizeObserver.observe).toHaveBeenCalledWith(freshElm);
  }
);

test('<ResponsiveClassNames/> renders with class names matching minimum only ranges.', () => {
  const { resizeObserver, render } = setup(config1);
  resizeObserver.mock.resizeCallback(entries1);
  const responsiveClassNames = getLatestClassNames(render);
  expect(responsiveClassNames.length).toBe(1);
  expect(responsiveClassNames[0]).toBe('large');
});

test('<ResponsiveClassNames/> renders with class names matching maximum only ranges.', () => {
  const { resizeObserver, render } = setup(config2);
  resizeObserver.mock.resizeCallback(entries2);
  const responsiveClassNames = getLatestClassNames(render);
  expect(responsiveClassNames.length).toBe(1);
  expect(responsiveClassNames[0]).toBe('small');
});

test('<ResponsiveClassNames/> renders with class names matching both minimum and maximum ranges.', () => {
  const { resizeObserver, render } = setup(config3);
  resizeObserver.mock.resizeCallback(entries3);
  const responsiveClassNames = getLatestClassNames(render);
  expect(responsiveClassNames.length).toBe(1);
  expect(responsiveClassNames[0]).toBe('medium');
});

test('<ResponsiveClassNames/> renders without class names not matching minimum only ranges.', () => {
  const { resizeObserver, render } = setup(config1);
  resizeObserver.mock.resizeCallback(entries2);
  const responsiveClassNames = getLatestClassNames(render);
  expect(responsiveClassNames.length).toBe(0);
});

test('<ResponsiveClassNames/> renders without class names not matching maximum only ranges.', () => {
  const { resizeObserver, render } = setup(config1);
  resizeObserver.mock.resizeCallback(entries2);
  const responsiveClassNames = getLatestClassNames(render);
  expect(responsiveClassNames.length).toBe(0);
});

test('<ResponsiveClassNames/> renders without class names not matching minimum and maximum ranges.', () => {
  const { resizeObserver, render } = setup(config3);
  resizeObserver.mock.resizeCallback(entries1);
  const responsiveClassNames = getLatestClassNames(render);
  expect(responsiveClassNames.length).toBe(0);
  resizeObserver.mock.resizeCallback(entries2);
  const responsiveClassNames2 = getLatestClassNames(render);
  expect(responsiveClassNames2.length).toBe(0);
});

test(
  '<ResponsiveClassNames/> renders with all class names when more than one is matching, ' +
    'and with rules specifying both width and height ranges.',
  () => {
    const { resizeObserver, render } = setup(config4);
    resizeObserver.mock.resizeCallback(entries4);
    const responsiveClassNames = getLatestClassNames(render);
    expect(responsiveClassNames.length).toBe(2);
    expect(responsiveClassNames).toEqual(expect.arrayContaining(['wide', 'big']));
  }
);

test('<ResponsiveClassNames/> renders without class names not matching one of width or height ranges when both are specified.', () => {
  const { resizeObserver, render } = setup(config4);
  resizeObserver.mock.resizeCallback(entries3);
  const responsiveClassNames = getLatestClassNames(render);
  expect(responsiveClassNames.length).toBe(1);
  expect(responsiveClassNames[0]).toBe('wide');
});
