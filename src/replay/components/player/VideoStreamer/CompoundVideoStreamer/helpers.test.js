import { detectStreamType } from './helpers';

test('detectStreamType() returns streamTypes entries dash, hls, smooth, progressive based on exact contentType match.', () => {
  expect(detectStreamType('http://example.com/video/stream', 'application/dash+xml')).toMatchObject({ name: 'dash' });
  expect(detectStreamType('http://example.com/video/stream', 'application/DASH+XML')).toMatchObject({ name: 'dash' }); // Verifying case insensitivity.
  expect(detectStreamType('http://example.com/video/stream', 'application/x-mpegurl')).toMatchObject({ name: 'hls' });
  expect(detectStreamType('http://example.com/video/stream', 'vnd.apple.mpegurl')).toMatchObject({ name: 'hls' });
  expect(detectStreamType('http://example.com/video/stream', 'application/vnd.ms-sstr+xml')).toMatchObject({
    name: 'smooth'
  });
  expect(detectStreamType('http://example.com/video/stream', 'video/mp4')).toMatchObject({ name: 'progressive' });
  expect(detectStreamType('http://example.com/video/stream', 'video/webm')).toMatchObject({ name: 'progressive' });
});
test('detectStreamType() returns the dash streamType for sources with no content type and URL containing at least ".mpd".', () => {
  expect(detectStreamType('http://example.com/video/stream.mpd?yes=no')).toMatchObject({ name: 'dash' });
  expect(detectStreamType('http://example.com/video/stream.mpd')).toMatchObject({ name: 'dash' });
  expect(detectStreamType('http://example.com/video/stream-mpd')).toMatchObject({ name: 'progressive' });
});
test('detectStreamType() returns the hls streamType for sources with no content type and URL containing at least ".m3u8".', () => {
  expect(detectStreamType('http://example.com/video/stream.m3u8?yes=no')).toMatchObject({ name: 'hls' });
  expect(detectStreamType('http://example.com/video/stream.m3u8')).toMatchObject({ name: 'hls' });
  expect(detectStreamType('http://example.com/video/stream-m3u')).toMatchObject({ name: 'progressive' });
});
test(
  'detectStreamType() returns the smooth streamType for sources with no content type and ' +
    'URL at least containing "/Manifest" and not containing ".mpd", ".mp4", or ".m3u8".',
  () => {
    expect(detectStreamType('http://example.com/video/stream.ism/Manifest?yes=no')).toMatchObject({ name: 'smooth' });
    expect(detectStreamType('http://example.com/video/stream.isml/Manifest')).toMatchObject({ name: 'smooth' });
    expect(detectStreamType('http://example.com/video/stream-Manifest')).toMatchObject({ name: 'progressive' });
    expect(detectStreamType('http://example.com/video/stream/Manifest.mpd')).toMatchObject({ name: 'dash' });
    expect(detectStreamType('http://example.com/video/stream/Manifest.m3u8')).toMatchObject({ name: 'hls' });
    expect(detectStreamType('http://example.com/video/stream/Manifest.mp4')).toMatchObject({ name: 'progressive' });
  }
);
test(
  'detectStreamType() returns the progressive streamType for sources with no content type and ' +
    'URL at least containing ".mp4" or ".webm".',
  () => {
    expect(detectStreamType('http://example.com/video/stream.mp4?yes=no')).toMatchObject({ name: 'progressive' });
    expect(detectStreamType('http://example.com/video/stream.mp4')).toMatchObject({ name: 'progressive' });
    expect(detectStreamType('http://example.com/video/stream.webm?yes=no')).toMatchObject({ name: 'progressive' });
    expect(detectStreamType('http://example.com/video/stream.webm')).toMatchObject({ name: 'progressive' });
  }
);
test('detectStreamType() returns the progressive streamType when no content types or URL patterns match.', () => {
  expect(detectStreamType('http://example.com/video/stream?yes=no', 'video/x-ms-wmv')).toMatchObject({
    name: 'progressive'
  });
  expect(detectStreamType('http://example.com/video/stream.mpd', 'video/x-ms-wmv')).toMatchObject({
    name: 'progressive'
  });
  expect(detectStreamType('http://example.com/video/stream?yes=no')).toMatchObject({ name: 'progressive' });
});
