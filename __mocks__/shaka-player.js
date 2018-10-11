
export const configure = jest.fn();
export const destroy = jest.fn();

const shaka = {
  net: {
    NetworkingEngine: {
      RequestType: {
        MANIFEST: 'MANIFEST'
      }
    }
  },
  util: {
    StringUtils: {
      fromUTF8: d => d
    }
  },
  Player: jest.fn(() => ({
    configure,
    destroy
  })),
  polyfill: {
    installAll: jest.fn()
  }
};

export default shaka;