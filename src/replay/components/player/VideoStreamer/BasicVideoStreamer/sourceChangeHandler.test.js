import getSourceChangeHandler from './sourceChangeHandler';

window.HTMLMediaElement.prototype.play = function() {};
window.HTMLMediaElement.prototype.pause = function() {};
window.HTMLMediaElement.prototype.load = function() {};
HTMLMediaElement.prototype.play = function() {};
HTMLMediaElement.prototype.pause = function() {};
HTMLMediaElement.prototype.load = function() {};

test("Source handler applies the stream URL to the video element's src attribute/property.", () => {
  const videoElement = document.createElement('video');
  const handleSourceChange = getSourceChangeHandler(videoElement);
  const props1 = { source: { streamUrl: 'https://example.com/stream' } };
  const props2 = { source: 'https://example.com/stream2' };
  return handleSourceChange(props1, {})
    .then(() => {
      expect(videoElement.src).toBe('https://example.com/stream');
    })
    .then(() => {
      return handleSourceChange(props2, props1).then(() => {
        expect(videoElement.src).toBe('https://example.com/stream2');
      });
    });
});

test("Source handler removes video element's src attribute/property when there is no valid stream URL or source.", () => {
  const videoElement = document.createElement('video');
  const handleSourceChange = getSourceChangeHandler(videoElement);
  const props1 = { source: { streamUrl: 'https://example.com/stream' } };
  return handleSourceChange(props1, {}).then(() => {
    return handleSourceChange({ source: {} }, props1).then(() => {
      expect(videoElement.getAttribute('src')).toBe(null);
      return handleSourceChange({}).then(() => {
        expect(videoElement.getAttribute('src')).toBe(null);
      });
    });
  });
});
