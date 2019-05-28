/* eslint no-use-before-define: 0 */

let logger;
let store;

let focusWindow;
const focusDelay = 5000;
let focusInterval;

const forceFocus = (_focusWindow, _logger, _store) => {
  focusWindow = _focusWindow;
  logger = _logger;
  store = _store;

  logger.info('forceFocus: Initialized');

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
    const isBrowsingContent = store.get('kiosk.browsingContent');
    if (isBrowsingContent === true || isBrowsingContent === 1) {
      console.log('forcing focus');
      // First, tell OS to focus on this window
      focusWindow.focus();

      // Then focus on web page (for keyboard events).
      focusWindow.webContents.focus();
    } else {
      // We are no longer browsing content. Stop setting focus.
      clearInterval(focusInterval);
    }
  }, focusDelay);
};

export default forceFocus;
