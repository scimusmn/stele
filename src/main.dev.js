/* eslint global-require: off */

//
// This module executes inside of electron's main process. You can start
// electron renderer process from here and communicate with the other processes
// through IPC.
//
// When running `yarn build` or `yarn build-main`, this file is compiled to
// `./app/main.prod.js` using webpack. This gives us some performance wins.
//
import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import settings from 'electron-settings';
import childProcess from 'child_process';
import MenuBuilder from './menu';

const promisedExec = childProcess.exec;

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

// Install extra Chrome dev tools to help us debug our React app
const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  )
    .catch(console.log);
};

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  //
  // Define default settings
  //
  settings.set('appFocus', { url: null });

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Respond to IPC commands from the client app
  ipcMain.on('ipc-test-channel', (event, arg) => {
    console.log(event);
    console.log('----^ ^ ^ ^ ^ event ^ ^ ^ ^ ^----');
    console.log(arg);
    console.log('----^ ^ ^ ^ ^ arg ^ ^ ^ ^ ^----');
  });

  //
  // Keyboard shortcuts
  //
  // Ctrl or Command + f will switch you to the Finder.
  // We use the "switch to Finder" approach instead of a quit, because in most
  // of our Electron setups we have a launchd process that will relaunch the
  // app on quit. For maintenance, we probably just need to be able to get
  // to the Finder while the application remains running in the background.
  //
  // TODO: Make this work on Windows and Linux
  //
  globalShortcut.register('Control+F', () => {
    console.log('Switching to Finder');
    promisedExec('open -a Finder');
  });


  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});