import { ipcMain, BrowserWindow } from 'electron';
import _ from 'lodash';
import log from 'electron-log';

// TODO: Turn this into a general navigation function where you pass in the path
// Use this for settings and delay
const mainWindowNavigateSettings = (window, reactHome, store) => {
  store.set('kiosk.browsingContent', 0);
  window.show();
  if (process.env.NODE_ENV === 'production') {
    window.setKiosk(false);
  }
  window.loadURL(reactHome);
  ipcMain.on('routerMounted', () => {
    clearTimeout(global.delayTimer);
    window.webContents.send('navigate', '/settings');
  });
};

const navigateSettings = (window, reactHome, store) => {
  // Navigate to delay message during delay period
  log.info('Window - Navigating to Settings with keyboard shortcut');
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
  mainWindowNavigateSettings(window, reactHome, store);
};

export { navigateSettings, mainWindowNavigateSettings };
