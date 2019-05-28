import _ from 'lodash';
import { BrowserWindow } from 'electron';
import delay from './delay';
import logger from '../logger/logger';
import forceFocus from '../focus/forceFocus';
import { mainWindowNavigateDelay, navigateAppToSettings } from './navigate';

// Load the configured kiosk URL immediately.
const loadWindowNow = (mainWindow, store) => {
  const storeDisplays = store.get('kiosk.displays');

  logger.info('Window - Immediately loading windows');
  if (storeDisplays[0].enabled) {
    // Ensure that the main window is positioned on the primary display
    mainWindow.setPosition(0, 0);
    if (process.env.NODE_ENV === 'production') {
      mainWindow.setKiosk(true);
    }
    mainWindow.loadURL(storeDisplays[0].url);

    // Setup force focus if necessary
    if (storeDisplays[0].forceFocus === true) {
      forceFocus(mainWindow, logger, store);
    }
  } else {
    if (process.env.NODE_ENV === 'production') {
      mainWindow.setKiosk(false);
    }
    mainWindow.hide();
  }
  const secondaryWindows = [];
  if (storeDisplays.length > 1) {
    _.forEach(storeDisplays, (display, index) => {
      if (index !== 0) {
        // Don't launch windows that are linked to disconnected displays
        if (display.connected && display.enabled) {
          secondaryWindows[index] = new BrowserWindow({
            x: storeDisplays[index].bounds.x,
            y: 0,
            show: false,
          });
          secondaryWindows[index].loadURL(storeDisplays[index].url);
          secondaryWindows[index].once('ready-to-show', () => {
            secondaryWindows[index].show();
            // Enable fullscreen kiosk mode for secondary windows in production
            if (process.env.NODE_ENV === 'production') {
              secondaryWindows[index].setKiosk(true);
            }
          });

          // Setup force focus if necessary
          if (storeDisplays[index].forceFocus === true) {
            forceFocus(secondaryWindows[index], logger, store);
          }
        }
      }
    });
  }
};

// Load the configured kiosk URL after a configured delay.
const loadWindowDelay = (mainWindow, store, delayValue) => {
  logger.info('Window - Delay started');
  mainWindowNavigateDelay(mainWindow, store, delayValue);

  // After delay, load configured content
  global.delayTimer = setTimeout(() => {
    logger.info('Window - Delay finished, navigating to configured content.');
    loadWindowNow(mainWindow, store);
  }, delayValue * 1000);
};

//
// Check whether we should display the delay or navigate to content immediately
//
const loadWindowDelayCheck = (mainWindow, store) => {
  const delayValue = delay();
  if (delayValue) {
    loadWindowDelay(mainWindow, store, delayValue);
  } else {
    loadWindowNow(mainWindow, store);
  }
};

// Load the appropriate content in the kiosk window based on environment and config settings
function loadWindows(mainWindow, store) {
  //
  // Display React app loading spinner
  //
  // Always start by loading the React app
  // This will display the loading spinner while we check other setting and display details.
  mainWindow.loadURL(store.get('appHome'));

  //
  // Load content or go to Settings
  //
  // Check if any displays are enabled with content. If so, launch the app with the configured
  // content. If not, then load the Settings page.
  if (_.find(
    _.get(store.get('kiosk'), 'displays'),
    display => display.enabled && display.url !== '',
  )) {
    logger.info('Window - Display URLs configured, checking delay');
    loadWindowDelayCheck(mainWindow, store);
  } else {
    store.set('kiosk.browsingContent', 0);
    logger.info('Window - No content is configured in the store');
    navigateAppToSettings(mainWindow, store);
  }
}

export { loadWindows, loadWindowNow };
