export const configure = jest.fn();
export const destroy = jest.fn();

const shaka = {
  net: {
    NetworkingEngine: {
      RequestType: {
        MANIFEST: 0,
        SEGMENT: 1,
        LICENSE: 2,
        APP: 3,
        TIMING: 4
      }
    }
  },
  util: {
    StringUtils: {
      fromUTF8: d => d
    },
    Error: {
      Category: Object
    }
  },
  Player: jest.fn(() => ({
    configure,
    destroy
  })),
  polyfill: {
    installAll: jest.fn(),
    MediaCapabilities: {
      install: jest.fn()
    }
  }
};

export default shaka;
