let version = '0.0.0';
try {
  version = __VERSION__; // eslint-disable-line no-undef
} catch(e) {}
export default version;