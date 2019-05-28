import { ipcMain, BrowserWindow } from 'electron';
import _ from 'lodash';
import log from 'electron-log';

// Navigate the main window to the Settings page
const mainWindowNavigateSettings = (mainWindow, store, path, args) => {
  mainWindow.show();
  if (process.env.NODE_ENV === 'production') {
    mainWindow.setKiosk(false);
  }
  mainWindow.loadURL(store.get('appHome'));
  ipcMain.on('routerMounted', () => {
    clearTimeout(global.delayTimer);
    mainWindow.webContents.send('navigate', path, args);
  });
};

// Navigate the main window to the Delay page
const mainWindowNavigateDelay = (mainWindow, store, delayValue) => {
  mainWindow.loadURL(store.get('appHome'));
  ipcMain.on('routerMounted', () => {
    mainWindow.webContents.send('navigate', '/delay-start', delayValue);
  });
};

//
// Close all windows, except for the main window and navigate to the Settings page
//
const navigateAppToSettings = (mainWindow, store) => {
  // Navigate to delay message during delay period
  log.info('Window - Navigating to Settings');

  // Set a boolean to show we are no longer
  // looking at browsing content.
  store.set('kiosk.browsingContent', 0);

  // Close windows on the secondary displays
  const windowsToClose = BrowserWindow.getAllWindows();
  _.forEach(windowsToClose, (windowToClose) => {
    if (windowToClose.id > 1) {
      // Take the window out of fullscreen mode
      if (process.env.NODE_ENV === 'production') {
        windowToClose.setKiosk(false);
      }
      windowToClose.close();
    }
  });
  mainWindowNavigateSettings(mainWindow, store, '/settings');
};

export { mainWindowNavigateSettings, mainWindowNavigateDelay, navigateAppToSettings };
