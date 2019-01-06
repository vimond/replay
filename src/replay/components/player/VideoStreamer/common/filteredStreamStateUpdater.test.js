import getFilteredStreamStateUpdater from './filteredStreamStateUpdater';

// const positionFilter = (position: ?number): number => (isNaN(position) || position == null ? 0 : position);

test('Filtered property updater notifies when fresh values are passed for properties earlier passed.', () => {
  const callback = jest.fn();
  const update = getFilteredStreamStateUpdater({ props: { onStreamStateChange: callback } });
  update({ duration: 0 });
  update({ duration: 313 });
  expect(callback.mock.calls[0][0]).toEqual({ duration: 0 });
  expect(callback.mock.calls[1][0]).toEqual({ duration: 313 });
});

test('Filtered property updater does not notify when the same values as earlier are passed as properties.', () => {
  const callback = jest.fn();
  const update = getFilteredStreamStateUpdater({ props: { onStreamStateChange: callback } });
  update({ duration: 0 });
  update({ duration: 0 });
  update({ duration: 313 });
  expect(callback.mock.calls[0][0]).toEqual({ duration: 0 });
  expect(callback.mock.calls[1][0]).toEqual({ duration: 313 });
});

test('Filtered property updater notifies each passed property individually.', () => {
  const callback = jest.fn();
  const update = getFilteredStreamStateUpdater({ props: { onStreamStateChange: callback } });
  update({ position: 0 });
  update({ position: 3, duration: 313 });
  expect(callback).toHaveBeenCalledWith({ duration: 313 });
  expect(callback).toHaveBeenCalledWith({ position: 0 });
  expect(callback).toHaveBeenCalledWith({ position: 3 });
});

test('Filtered property updater notifies with a corrected value when default filters are used.', () => {
  const callback = jest.fn();
  const update = getFilteredStreamStateUpdater({ props: { onStreamStateChange: callback } });
  update({ position: NaN });
  expect(callback).toHaveBeenCalledWith({ position: 0 });

  update({ position: undefined });
  expect(callback).toHaveBeenCalledTimes(1);

  update({ position: 13 });
  expect(callback).toHaveBeenCalledWith({ position: 13 });
});
