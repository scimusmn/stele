import { ipcMain } from 'electron';
import { loadWindowNow } from '../windows/loadWindows';

//
// Skip delay
//
// Navigate to the main URL if the user clicks on the skip delay button on the delay page
//
const skipDelay = (logger, store, mainWindow) => {
  ipcMain.on('skipDelay', () => {
    logger.info('Window - Delay skipped');
    store.set('kiosk.browsingContent', 1);
    loadWindowNow(mainWindow, store);
  });
};

export default skipDelay;
