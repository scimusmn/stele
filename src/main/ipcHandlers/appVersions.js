import { ipcMain } from 'electron';
import { version as steleVersion } from '../../../package.json';

const appVersions = () => {
  ipcMain.on('appVersions', (event) => {
    /* eslint no-param-reassign: off */
    event.returnValue = {
      stele: steleVersion,
      electron: process.versions.electron,
      chrome: process.versions.chrome,
    };
  });
};

export default appVersions;
