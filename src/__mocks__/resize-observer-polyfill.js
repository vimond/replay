
function ResizeObserver(resizeCallback) {
  return {
    observe: jest.fn(),
    disconnect: jest.fn(),
    mock: {
      resizeCallback
    }
  };
}

export default ResizeObserver;