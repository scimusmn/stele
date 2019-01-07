import { ipcMain, BrowserWindow } from 'electron';
import _ from 'lodash';
import log from 'electron-log';

const navigateSettings = (window, reactHome) => {
  // Navigate to delay message during delay period
  log.info('Window - Navigating to Settings with keyboard shortcut');
  // Close windows on the secondary displays
  const windowsToClose = BrowserWindow.getAllWindows();
  _.forEach(windowsToClose, (windowToClose) => {
    if (windowToClose.id > 1) {
      windowToClose.close();
    }
  });
  // TODO: Make this a function
  // Make this little bit a function that you can import and reuse
  window.loadURL(reactHome);
  ipcMain.on('routerMounted', () => {
    clearTimeout(global.delayTimer);
    window.webContents.send('navigate', '/settings');
  });
};

export default navigateSettings;
