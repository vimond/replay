import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import TimelineInformation from './TimelineInformation';

Enzyme.configure({ adapter: new Adapter() });

test('<TimelineInformation/> renders with a time formatted preview value.', () => {
  const rendered = shallow(
    <TimelineInformation
      classNamePrefix="c-"
      absoluteStartPosition={new Date()}
      playMode={'ondemand'}
      duration={300}
      previewValue={90}
      isDragging={false}
    />
  );
  const tooltip = rendered.find('div.c-timeline-tooltip');
  expect(tooltip.text()).toMatch('1:30');
  const rendered2 = shallow(
    <TimelineInformation
      classNamePrefix="c-"
      absoluteStartPosition={new Date('2018-10-03T10:26:12Z')}
      playMode={'livedvr'}
      duration={300}
      previewValue={90}
    />
  );
  const tooltip2 = rendered2.find('div.c-timeline-tooltip');
  expect(tooltip2.text()).toMatch(':42'); // Very limited match in order to avoid timezone trouble. And we are not testing the formatting per se.
});

test('<TimelineInformation/> renders with tooltip stated to be visible only if dragging or mouse entered.', () => {
  const visibles = [];
  visibles.push(shallow(<TimelineInformation classNamePrefix="c-" isDragging={true} isPointerInside={false} />));
  visibles.push(shallow(<TimelineInformation classNamePrefix="c-" isDragging={true} isPointerInside={true} />));
  visibles.push(shallow(<TimelineInformation classNamePrefix="c-" isDragging={false} isPointerInside={true} />));
  visibles.forEach(visible =>
    expect(visible.find('div.c-timeline-tooltip').hasClass('c-timeline-tooltip-visible')).toBe(true)
  );
  const invisible = shallow(<TimelineInformation classNamePrefix="c-" isDragging={false} isPointerInside={false} />);
  expect(invisible.find('div.c-timeline-tooltip').hasClass('c-timeline-tooltip-visible')).toBe(false);
});
