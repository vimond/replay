function HlsClass(config) {
  const on = jest.fn();
  on.mockImplementation((name, handler) => setTimeout(handler, 10));

  return {
    attachMedia: jest.fn(),
    detachMedia: jest.fn(),
    stopLoad: jest.fn(),
    on,
    destroy: jest.fn()
  };
}

const Hls = jest.fn(HlsClass);
Hls.ErrorTypes = {};
Hls.ErrorDetails = {};
Hls.Events = {
  MEDIA_ATTACHED: 'mediaAttached'
};
Hls.isSupported = jest.fn().mockReturnValue(true);

export default Hls;
