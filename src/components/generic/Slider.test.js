import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Slider from './Slider';

Enzyme.configure({ adapter: new Adapter() });

const mockHandleContent = <span />;
const mockBarContent = <div />;
const mockTrackContent = <svg />;

//TODO: Vertical mode! Double up every test?

function shallowRenderSlider({
  value = 10,
  maxValue = 45,
  classNamePrefix,
  className,
  handleClassName = 'myitemclassname',
  trackContent,
  children,
  handleContent,
  label = 'My slider',
  onValueChange,
  onDrag
} = {}) {
  return shallow(
    <Slider
      className={className}
      classNamePrefix={classNamePrefix}
      handleClassName={handleClassName}
      value={value}
      maxValue={maxValue}
      label={label}
      handleContent={handleContent}
      trackContent={trackContent}
      onDrag={onDrag}
      onValueChange={onValueChange}>
      {children}
    </Slider>
  );
}

test('<Slider/> should insert the specified track content, bar content, and handle content in to its UI, in this order. Custom class names with prefixes should be applied.', () => {
  const shallowElement = shallowRenderSlider({
    children: mockBarContent,
    handleContent: mockHandleContent,
    trackContent: mockTrackContent,
    className: 'myclassname',
    handleClassName: 'myhandleclassname',
    trackClassName: 'mytrackclassname',
    classNamePrefix: 'myprefix-'
  });
  expect(shallowElement.name()).toBe('div');
  expect(shallowElement.hasClass('myprefix-slider')).toBe(true);
  expect(shallowElement.hasClass('myprefix-myclassname')).toBe(true);
  expect(shallowElement.hasClass('myprefix-dragging')).toBe(false);
  expect(shallowElement.props().title).toBe('My slider');
  expect(shallowElement.children().length).toBe(3);

  expect(shallowElement.childAt(1).name()).toBe('div'); // children

  const trackElement = shallowElement.childAt(0);
  expect(trackElement.name()).toBe('div');
  expect(trackElement.childAt(0).name()).toBe('svg');

  const handleElement = shallowElement.childAt(2);
  expect(handleElement.name()).toBe('div');
  expect(handleElement.childAt(0).name()).toBe('span');
  expect(handleElement.hasClass('myprefix-slider-handle')).toBe(true);
  expect(handleElement.hasClass('myprefix-myhandleclassname')).toBe(true);
});

test('<Slider/> should position the handle relatively according to different specified values between 0 and the specified max value.', () => {
  const shallowElement = shallowRenderSlider({ value: 20, maxValue: 400, handleContent: mockHandleContent });
  expect(shallowElement.childAt(1).prop('style')).toHaveProperty('left', '5.000%');
  shallowElement.setProps({ value: 400 });
  expect(shallowElement.childAt(1).prop('style')).toHaveProperty('left', '100.000%');
  shallowElement.setProps({ value: 0 });
  expect(shallowElement.childAt(1).prop('style')).toHaveProperty('left', '0%');
  shallowElement.setProps({ value: 50.3, maxValue: 300 });
  expect(shallowElement.childAt(1).prop('style')).toHaveProperty('left', '16.767%');
});

test('The <Slider/> handle should be positioned to the left/bottom when specifying values or max values not making sense or not being numbers.', () => {
  expect(
    shallowRenderSlider({ value: 20, maxValue: Infinity, handleContent: mockHandleContent })
      .childAt(1)
      .prop('style')
  ).toHaveProperty('left', '0%');
  expect(
    shallowRenderSlider({ value: Infinity, maxValue: 2, handleContent: mockHandleContent })
      .childAt(1)
      .prop('style')
  ).toHaveProperty('left', '0%');
  expect(
    shallowRenderSlider({ value: 10, maxValue: 0, handleContent: mockHandleContent })
      .childAt(1)
      .prop('style')
  ).toHaveProperty('left', '0%');
  expect(
    shallowRenderSlider({ value: 0, maxValue: 0, handleContent: mockHandleContent })
      .childAt(1)
      .prop('style')
  ).toHaveProperty('left', '0%');
  expect(
    shallowRenderSlider({ value: 0, maxValue: NaN, handleContent: mockHandleContent })
      .childAt(1)
      .prop('style')
  ).toHaveProperty('left', '0%');
  expect(
    shallowRenderSlider({ value: 0, maxValue: null, handleContent: mockHandleContent })
      .childAt(1)
      .prop('style')
  ).toHaveProperty('left', '0%');
  expect(
    shallowRenderSlider({ value: { yes: 'no' }, maxValue: 167671, handleContent: mockHandleContent })
      .childAt(1)
      .prop('style')
  ).toHaveProperty('left', '0%');
  expect(
    shallowRenderSlider({ value: null, maxValue: undefined, handleContent: mockHandleContent })
      .childAt(1)
      .prop('style')
  ).toHaveProperty('left', '0%');
});

test('When clicking on a slider position, the <Slider/> should report the updated absolute value between 0 and the specified max value.', () => {
  const mockEventElement = {
    getBoundingClientRect: function() {
      return {
        top: 13,
        left: 313,
        width: 300,
        height: 40
      };
    }
  };
  const mockEvent1 = {
    currentTarget: mockEventElement,
    pageX: 456,
    pageY: 23
  };
  const outOfBoundsEvent = {
    currentTarget: mockEventElement,
    pageX: 800,
    pageY: 23
  };
  const handleValueChange = jest.fn();
  const shallowElement = shallowRenderSlider({
    value: 20,
    maxValue: 400,
    handleContent: mockHandleContent,
    onValueChange: handleValueChange
  });
  shallowElement.instance().renderedTrack = mockEventElement;
  shallowElement.instance().handleHandleOrTrackClick(mockEvent1);
  shallowElement.instance().handleHandleOrTrackClick(outOfBoundsEvent);
  expect(handleValueChange.mock.calls[0][0].toFixed(2)).toBe('190.67');
  expect(handleValueChange.mock.calls[1][0]).toBe(400);
});

test(
  'When dragging the slider handle, the <Slider/> should not report a new value before dragging ends, but rather report movements as a drag in progress. ' +
    'The handle position should be updated continuously during dragging. ' +
    'It should reflect the dragging state in class names.',
  () => {
    const mockEventElement = {
      getBoundingClientRect: function() {
        return {
          top: 13,
          left: 313,
          width: 300,
          height: 40
        };
      }
    };
    const mockEvent1 = {
      currentTarget: mockEventElement,
      pageX: 456,
      pageY: 23
    };
    const mockEvent2 = {
      currentTarget: mockEventElement,
      pageX: 567,
      pageY: 234 // Out of bounds, but in the insignificant direction.
    };
    const mockEvent3 = {
      currentTarget: mockEventElement,
      pageX: 598,
      pageY: 42
    };
    const mockEvent4 = {
      currentTarget: mockEventElement,
      pageX: 555,
      pageY: 78
    };
    const outOfBoundsEvent = {
      currentTarget: mockEventElement,
      pageX: 800,
      pageY: 23
    };
    const handleValueChange = jest.fn();
    const handleDrag = jest.fn();
    const shallowElement = shallowRenderSlider({
      value: 20,
      maxValue: 400,
      classNamePrefix: 'myprefix-',
      handleContent: mockHandleContent,
      onValueChange: handleValueChange,
      onDrag: handleDrag
    });
    shallowElement.instance().renderedTrack = mockEventElement;

    // "Mouse down".
    shallowElement.instance().handleHandleStartDrag(mockEvent1);
    shallowElement.update();
    expect(shallowElement.hasClass('myprefix-dragging')).toBe(true);
    expect(handleDrag.mock.calls.length).toBe(1);
    expect(handleValueChange.mock.calls.length).toBe(0);

    // "Mouse moves".
    shallowElement.instance().handleHandleDrag(mockEvent1);
    shallowElement.instance().handleHandleDrag(mockEvent2);
    shallowElement.update(); // A bit random how setState will be invoked...

    expect(shallowElement.childAt(1).prop('style')).toHaveProperty('left', '84.667%');

    shallowElement.instance().handleHandleDrag(outOfBoundsEvent);
    shallowElement.update();
    expect(shallowElement.childAt(1).prop('style')).toHaveProperty('left', '100.000%');

    shallowElement.instance().handleHandleDrag(mockEvent3);
    shallowElement.update();

    expect(shallowElement.hasClass('myprefix-dragging')).toBe(true);
    expect(handleDrag.mock.calls[1][0].toFixed(2)).toBe('190.67');
    expect(handleDrag.mock.calls[2][0].toFixed(2)).toBe('338.67');
    expect(handleDrag.mock.calls[3][0].toFixed(2)).toBe('400.00');
    expect(handleDrag.mock.calls[4][0].toFixed(2)).toBe('380.00');

    // "Mouse up".
    shallowElement.instance().handleHandleEndDrag(mockEvent4);
    shallowElement.update();

    expect(shallowElement.childAt(1).prop('style')).toHaveProperty('left', '5.000%');
    expect(handleDrag.mock.calls[5][0].toFixed(2)).toBe('322.67'); // We also update the drag position at the mouse button release moment.
    expect(handleValueChange.mock.calls[0][0].toFixed(2)).toBe('322.67');
  }
);

test('The <Slider/> should not update the UI based on new props while the handle is pressed. However it needs fall back to the last set value in props when the handle is released.', () => {
  const mockEventElement = {
    getBoundingClientRect: function() {
      return {
        top: 13,
        left: 313,
        width: 300,
        height: 40
      };
    }
  };
  const mockEvent1 = {
    currentTarget: mockEventElement,
    pageX: 456,
    pageY: 23
  };
  const mockEvent2 = {
    currentTarget: mockEventElement,
    pageX: 567,
    pageY: 234 // Out of bounds, but in the insignificant direction.
  };
  const mockEvent3 = {
    currentTarget: mockEventElement,
    pageX: 555,
    pageY: 78
  };
  const handleValueChange = jest.fn();
  const handleDrag = jest.fn();
  const shallowElement = shallowRenderSlider({
    value: 20,
    maxValue: 400,
    handleContent: mockHandleContent,
    onValueChange: handleValueChange,
    onDrag: handleDrag
  });
  shallowElement.instance().renderedTrack = mockEventElement;

  // "Mouse down".
  shallowElement.instance().handleHandleStartDrag(mockEvent1);
  shallowElement.update();

  shallowElement.instance().handleHandleDrag(mockEvent1);
  shallowElement.instance().handleHandleDrag(mockEvent2);
  shallowElement.update(); // A bit random how setState will be invoked...

  expect(shallowElement.childAt(1).prop('style')).toHaveProperty('left', '84.667%');
  shallowElement.setProps({ value: 100 });
  shallowElement.update(); // Just to be sure.

  expect(handleDrag.mock.calls.length).toBe(3);
  expect(handleValueChange.mock.calls.length).toBe(0);
  expect(shallowElement.childAt(1).prop('style')).toHaveProperty('left', '84.667%');

  // "Mouse up".
  shallowElement.instance().handleHandleEndDrag(mockEvent3);
  shallowElement.update();

  expect(shallowElement.childAt(1).prop('style')).toHaveProperty('left', '25.000%');
  expect(handleDrag.mock.calls[3][0].toFixed(2)).toBe('322.67');
  expect(handleValueChange.mock.calls[0][0].toFixed(2)).toBe('322.67'); // New props ignored.

  shallowElement.setProps({ value: 200 });
  shallowElement.update();
  expect(shallowElement.childAt(1).prop('style')).toHaveProperty('left', '50.000%'); // Not ignored anymore.
});
