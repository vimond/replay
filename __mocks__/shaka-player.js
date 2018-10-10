
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
  }
};

export default shaka;