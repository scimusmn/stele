import fs from 'fs';
import { ipcMain } from 'electron';
import setupDisplays from '../displays/setupDisplays';
import handleAutoLaunch from '../autoLaunch/handleAutoLaunch';
import { navigateAppToSettings } from '../windows/navigate';

//
// Delete the electron-store config file and reset the app to defaults
//
const deleteConfig = (logger, store, mainWindow) => {
  ipcMain.on('deleteConfig', () => {
    const appHome = store.get('appHome');
    const configPath = store.path;

    logger.info(`App - Deleting config file at ${configPath}`);

    try {
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }
    } catch (error) {
      logger.error(`App - Failed to delete config file: ${error}`);
      return;
    }

    store.clear();

    // Restore runtime keys that the app needs to keep functioning
    store.set('appHome', appHome);
    store.set('quitting', false);
    store.set('kiosk.browsingContent', 0);

    setupDisplays(store, logger);
    handleAutoLaunch(false, logger);
    navigateAppToSettings(mainWindow, store);
  });
};

export default deleteConfig;
