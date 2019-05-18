import { ipcMain } from 'electron';
import _ from 'lodash';
import { loadWindowNow } from '../windows/loadWindows';
import handleAutoLaunch from '../autoLaunch/handleAutoLaunch';

//
// Update settings from the client using IPC
//
const updateSettings = (logger, store, mainWindow) => {
  ipcMain.on('updateSettings', (event, arg) => {
    // Filter out displays that are not connected, and that the user has
    // marked to forget on the settings page.
    const displaysRemembered = _.filter(arg.displays, display => display.forgetting !== true);

    // Save updated settings information in the data store
    store.set({
      'kiosk.displays': displaysRemembered,
      'kiosk.cursorVisibility': arg.cursorVis,
      'kiosk.autoLaunch': arg.autoLaunch,
      'kiosk.devToolsShortcut': arg.devToolsShortcut,
      'kiosk.cookieName': arg.cookieName,
      'kiosk.cookieValue': arg.cookieValue,
      'kiosk.cookieURL': arg.cookieURL,
    });
    store.set('kiosk.browsingContent', 1);
    loadWindowNow(mainWindow, store);
    handleAutoLaunch(store.get('kiosk.autoLaunch'), logger);
  });
};

export default updateSettings;
