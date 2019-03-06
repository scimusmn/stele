import _ from 'lodash';
import { BrowserWindow } from 'electron';
import { getDelayTime, checkUptime } from './delay';
import logger from './logger';

// Load the configured kiosk URL immediately.
function loadWindowNow(mainWindow, store) {
  const storeDisplays = store.get('kiosk.displays');
  logger.info('Window - Immediately loading windows');
  if (storeDisplays[0].enabled) {
    // Ensure that the main window is positioned on the primary display
    mainWindow.setPosition(0, 0);
    if (process.env.NODE_ENV === 'production') {
      mainWindow.setKiosk(true);
    }
    mainWindow.loadURL(storeDisplays[0].url);
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
        }
      }
    });
  }
}

// Load the configured kiosk URL after a configured delay.
function loadWindowDelay(mainWindow, store) {
  // We set a default here to ensure that we pass a required delay time to the route
  // even if this gets called with an invalid delay time.
  const delayTime = getDelayTime(30);
  logger.info('Window - Delay triggered');
  mainWindow.webContents.send('navigate', '/delay-start', delayTime);
  // After delay, load configured content
  global.delayTimer = setTimeout(() => {
    store.set('kiosk.browsingContent', 1);
    loadWindowNow(mainWindow, store);
  }, delayTime * 1000);
}

// Load the appropriate content in the kiosk window based on environment and config settings
function loadWindow(mainWindow, store) {
  if (process.env.NODE_ENV === 'development') {
    store.set('kiosk.browsingContent', 1);
    const delayTime = getDelayTime();
    // In dev we only set a delay if it's explicitly set as an environment variable and
    // it's a real number greater than 0.
    if (_.isFinite(delayTime) && delayTime > 0) {
      loadWindowDelay(mainWindow, store);
    } else {
      loadWindowNow(mainWindow, store);
    }
  }
  if (process.env.NODE_ENV !== 'development') {
    if (!checkUptime()) {
      loadWindowDelay(mainWindow, store);
    } else {
      loadWindowNow(mainWindow, store);
    }
  }
}

export { loadWindow, loadWindowNow };
