/* eslint no-use-before-define: 0 */

let logger;

let focusWindow;
const focusDelay = 5000;
let focusInterval;

const forceFocus = (_focusWindow, _logger) => {
  focusWindow = _focusWindow;
  logger = _logger;

  logger.info('forceFocus: Initialization');
  console.log(focusWindow);

  if (focusWindow) {
    // Start force focus interval after loaded
    focusWindow.webContents.on('did-finish-load', () => {
      ensureWindowFocus();
    });
    // Stop interval when window closes.
    focusWindow.on('close', () => {
      clearInterval(focusInterval);
    });
  } else {
    console.log('WARNING: Null focus window');
    logger.info('WARNING: Null focus window');
  }
};

const ensureWindowFocus = () => {
  // When OS focus is outside Electron,
  // force focus on main window.
  clearInterval(focusInterval);
  focusInterval = setInterval(() => {
    // First, tell OS to focus on this window
    focusWindow.focus();

    // Then focus on web page (for keyboard events).
    focusWindow.webContents.focus();
  }, focusDelay);
};

export default forceFocus;
