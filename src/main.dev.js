/* eslint global-require: off */

//
// This module executes inside of electron's main process. You can start
// electron renderer process from here and communicate with the other processes
// through IPC.
//
// When running `yarn build` or `yarn build-main`, this file is compiled to
// `./app/main.prod.js` using webpack. This gives us some performance wins.
//
import { app, BrowserWindow, ipcMain } from 'electron';
import settings from 'electron-settings';
import _ from 'lodash';
import os from 'os';
import path from 'path';
import url from 'url';
import MenuBuilder from './menu';
import registerKeyboardShortcuts from './registerKeyboardShortcuts';

//
// Start main window container
//
// We will use this object to build out the Electron window
//
let mainWindow = null;

// Enable stack traces in production
if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

// Add useful debug features to Electron
if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
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

// Delay app loading until the system has been up for a few seconds
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

  // Setup keyboard shortcuts
  registerKeyboardShortcuts();

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});
