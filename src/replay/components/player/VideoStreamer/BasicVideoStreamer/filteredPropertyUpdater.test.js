import getFilteredPropertyUpdater from './filteredPropertyUpdater';

const positionFilter = (position: ?number) : number => isNaN(position) || position == null ? 0 : position;

test('Filtered property updater notifies when fresh values are passed for properties earlier passed.', () => {
  const callback = jest.fn();
  const { notifyPropertyChange } = getFilteredPropertyUpdater(callback);
  notifyPropertyChange({ duration: 0 });
  notifyPropertyChange({ duration: 313 });
  expect(callback.mock.calls[0][0]).toEqual({ duration: 0 });
  expect(callback.mock.calls[1][0]).toEqual({ duration: 313 });
  
});

test('Filtered property updater does not notify when the same values as earlier are passed as properties.', () => {
  const callback = jest.fn();
  const { notifyPropertyChange } = getFilteredPropertyUpdater(callback);
  notifyPropertyChange({ duration: 0 });
  notifyPropertyChange({ duration: 0 });
  notifyPropertyChange({ duration: 313 });
  expect(callback.mock.calls[0][0]).toEqual({ duration: 0 });
  expect(callback.mock.calls[1][0]).toEqual({ duration: 313 });
});

test('Filtered property updater notifies each passed property individually.', () => {
  const callback = jest.fn();
  const { notifyPropertyChange } = getFilteredPropertyUpdater(callback);
  notifyPropertyChange({ position: 0 });
  notifyPropertyChange({ position: 3, duration: 313 });
  expect(callback).toHaveBeenCalledWith({ duration: 313 });
  expect(callback).toHaveBeenCalledWith({ position: 0 });
  expect(callback).toHaveBeenCalledWith({ position: 3 });
});

test('Filtered property updater notifies a corrected value if a filter modifies it.', () => {
  const callback = jest.fn();
  const { notifyPropertyChange } = getFilteredPropertyUpdater(callback, { position: positionFilter });
  notifyPropertyChange({ position: NaN });
  expect(callback).toHaveBeenCalledWith({ position: 0 });
  
  notifyPropertyChange({ position: undefined });
  expect(callback).toHaveBeenCalledTimes(1);
  
  notifyPropertyChange({ position: 13 });
  expect(callback).toHaveBeenCalledWith({ position: 13 });
});