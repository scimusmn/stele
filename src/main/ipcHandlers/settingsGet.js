import { ipcMain } from 'electron';

const settingsGet = (store) => {
  ipcMain.on('settingsGet', (event) => {
    /* eslint no-param-reassign: off */
    event.returnValue = store.get('kiosk');
  });
};

export default settingsGet;
