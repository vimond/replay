export function getFullscreenElement() {
  // Ridiculous camel casing confusion ruling the Interwebs.
  return (
    document.fullScreenElement ||
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.webkitFullScreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

export function enterFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
    return true;
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
    return true;
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    return true;
  } else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen(); // ALLOW_KEY_BOARD_INPUT makes this function not work in older Safari versions.
    return true;
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
    return true;
  }
  return false;
}

export function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.webkitExitFullScreen) {
    document.webkitExitFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

export function notifyFullscreenChange(handler) {
  const fullscreenEventNames = [
    'fullscreenchange',
    'mozfullscreenchange',
    'webkitfullscreenchange',
    'MSFullscreenChange'
  ];

  fullscreenEventNames.forEach(function(eventName) {
    document.addEventListener(eventName, handler);
  });

  return function() {
    fullscreenEventNames.forEach(function(eventName) {
      document.removeEventListener(eventName, handler);
    });
  };
}
