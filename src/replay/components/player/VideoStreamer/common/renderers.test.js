import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { renderWithoutSource, renderWithSource } from './renderers';

Enzyme.configure({ adapter: new Adapter() });

test('renderWithoutSource()', () => {
  const videoRef = {
    current: null
  };
  const result = shallow(
    renderWithoutSource(videoRef, { onPlaying: 1, onError: 2 }, { className: 'my-video' }, [], 'my-base-class-name', {
      c: 3
    })
  );
  const videoElement = result.find('video');
  expect(videoElement.hasClass('my-base-class-name')).toBe(true);
  expect(videoElement.hasClass('my-video')).toBe(true);
  expect(videoElement.prop('src')).toBe(undefined);
  expect(videoElement.prop('style')).toEqual({ c: 3 });
  expect(videoElement.prop('onPlaying')).toEqual(1);
  expect(videoElement.prop('onError')).toEqual(2);
});

test('renderWithoutSource() with source specified.', () => {
  const videoRef = {
    current: null
  };
  const result = shallow(
    renderWithSource(
      videoRef,
      { onPlaying: 1, onError: 2 },
      { source: { streamUrl: 'http://example.com' }, className: 'my-video' },
      [],
      'my-base-class-name',
      { c: 3 }
    )
  );
  const videoElement = result.find('video');
  expect(videoElement.hasClass('my-base-class-name')).toBe(true);
  expect(videoElement.hasClass('my-video')).toBe(true);
  expect(videoElement.prop('src')).toBe('http://example.com');
  expect(videoElement.prop('style')).toEqual({ c: 3 });
  expect(videoElement.prop('onPlaying')).toEqual(1);
  expect(videoElement.prop('onError')).toEqual(2);

  const result2 = shallow(
    renderWithSource(videoRef, {}, { source: 'http://example.com/stream' }, 'my-base-class-name')
  );
  const videoElement2 = result2.find('video');
  expect(videoElement2.prop('src')).toBe('http://example.com/stream');
  expect(videoElement2.prop('style')).toBe(undefined);
});

test('renderWithoutSource() with source and text track data specified.', () => {
  const videoRef = {
    current: null
  };
  const result = shallow(
    renderWithSource(
      videoRef,
      { onPlaying: 1, onError: 2 },
      { source: { streamUrl: 'http://example.com' }, className: 'my-video' },
      [
        { src: 'abc.vtt', srclang: 'de', label: 'Deutsch', kind: 'subtitles', onRef: () => {} },
        { src: 'def.vtt', srclang: 'da', label: 'Dansk', kind: 'captions', onRef: () => {} }
      ],
      'my-base-class-name',
      { c: 3 }
    )
  );
  const tracks = result.find('track');
  expect(tracks.get(0).props.src).toBe('abc.vtt');
  expect(tracks.get(0).props.srcLang).toBe('de');
  expect(tracks.get(0).props.kind).toBe('subtitles');
  expect(tracks.get(0).props.label).toBe('Deutsch');
  expect(tracks.get(1).props.src).toBe('def.vtt');
  expect(tracks.get(1).props.srcLang).toBe('da');
  expect(tracks.get(1).props.kind).toBe('captions');
  expect(tracks.get(1).props.label).toBe('Dansk');
});

test('renderWithoutSource() with no source specified.', () => {
  const videoRef = {
    current: null
  };
  const result = shallow(
    renderWithSource(videoRef, { onPlaying: 1, onError: 2 }, { className: 'my-video' }, [], 'my-base-class-name', {
      c: 3
    })
  );
  const videoElement = result.find('video');
  expect(videoElement.hasClass('my-base-class-name')).toBe(true);
  expect(videoElement.hasClass('my-video')).toBe(true);
  expect(videoElement.prop('src')).toBe('');
  expect(videoElement.prop('style')).toEqual({ c: 3 });
  expect(videoElement.prop('onPlaying')).toBe(undefined);
  expect(videoElement.prop('onError')).toBe(undefined);
});
