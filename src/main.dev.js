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
import _ from 'lodash';
import os from 'os';
import path from 'path';
import url from 'url';
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

//
// Delay app loading until the system has been up for a few seconds
//
function loadWindowUptimeDelay(window, configFileObj) {
  // Seconds since launch, when it will be safe to load the URL
  const nominalUptime = 300;

  // Seconds to wait if we are not in the nominal uptime window
  const launchDelay = 60;

  if (os.uptime() > nominalUptime) {
    console.log('Launching immediately');
    window.loadURL(
      url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
      }),
    );
  } else {
    console.log(`Delaying launch ${launchDelay} seconds`);
    // window.loadURL(`file://${__dirname}/launch-delay.html?delay=${launchDelay}`);
    setTimeout(() => {
      window.loadURL(configFileObj.url);
    }, launchDelay * 1000);
  }
}

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  //
  // Lookup settings
  //
  // Default the app to the settings input page if app values aren't set.
  //
  const kioskSettings = settings.getAll();
  const mainWindowURL = _.get(
    kioskSettings,
    'kiosk.displayHome',
    `file://${__dirname}/index.html`
  );

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

  loadWindowUptimeDelay(mainWindow, mainWindowURL);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else if (process.env.NODE_ENV === 'development') {
        mainWindow.showInactive();
        if (process.env.HOT_RUN !== 'True') {
          mainWindow.focus();
          process.env.HOT_RUN = 'True';
        } else {
          mainWindow.blur();
        }
      } else {
        mainWindow.focus();
        mainWindow.show();
        //
        // Kiosk mode
        //
        // Enable fullscreen kiosk mode in production
        //
        mainWindow.setKiosk(true);
    }
  });

  //
  // Update settings from the client using IPC
  //
  ipcMain.on('updateSettings', (_, arg) => {
    console.log('setting settings');
    settings.set('kiosk', { displayHome: arg.url });
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
