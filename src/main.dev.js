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
import log from 'electron-log';
import _ from 'lodash';
import os from 'os';
import MenuBuilder from './menu';
import registerKeyboardShortcuts from './registerKeyboardShortcuts';

// Set log level to info
log.transports.file.level = 'info';

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

  return Promise
    .all(
      extensions.map(name => installer.default(installer[name], forceDownload))
    )
    .catch(console.log);
};

// Delay app loading until the system has been up for a few seconds
function loadWindowUptimeDelay(mainWindow, mainWindowURL) {
  // Seconds since launch, when it will be safe to load the URL
  const nominalUptime = 300;
  // Seconds to wait if we are not in the nominal uptime window
  const launchDelayCustom = _.toNumber(process.env.STELE_DELAY);
  if (os.uptime() < nominalUptime || _.isFinite(launchDelayCustom)) {
    // Navigate to delay message during delay period
    log.info('Window - Delay triggered');
    mainWindow.webContents.send('navigate', '/delay-start');
    const launchDelay = launchDelayCustom || 30;
    // After delay, load settings URL
    setTimeout(() => {
      mainWindow.loadURL(mainWindowURL);
    }, launchDelay * 1000);
  } else {
    // Immediately navigate to settings URL
    log.info('Window - Immediately loading settings URL');
    mainWindow.loadURL(mainWindowURL);
  }
}

app.on('ready', async () => {
  //
  // Start main window container
  //
  // We will use this object to build out the Electron window
  //
  // TODO: Move this into the ready
  let mainWindow = null;

  //
  // Lookup settings
  //
  // Default the app to the settings input page if app values aren't set.
  //
  const kioskSettings = settings.getAll();
  const reactHome = `file://${__dirname}/index.html`;
  const mainWindowURL = _.get(
    kioskSettings,
    'kiosk.displayHome',
    reactHome
  );

  // Setup browser extensions
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  // Setup default window size
  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  });
  log.info('Window - New browser window');

  // Start by loading the React home page
  mainWindow.loadURL(reactHome);
  log.info('Window - Load React home');

  // Once our react app has mounted, we can load kiosk content
  ipcMain.on('routerMounted', () => {
    log.info('Window - React router mounted');
    if (_.has(kioskSettings, 'kiosk.displayHome')) {
      log.info('Window - URL set, checking delay');
      loadWindowUptimeDelay(mainWindow, mainWindowURL);
    } else {
      log.info('Window - No URL set, sending React to settings page');
      mainWindow.webContents.send('navigate', '/settings');
    }
  });

  //
  // Update settings from the client using IPC
  //
  ipcMain.on('updateSettings', (_, arg) => {
    settings.set('kiosk', { displayHome: arg.url });
  });

  // Setup keyboard shortcuts
  registerKeyboardShortcuts();

  // Setup application menu
  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  //
  // Show the app window once everything has loaded
  //
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Enable fullscreen kiosk mode in production
    if (process.env.NODE_ENV === 'production') {
      mainWindow.setKiosk(true);
    }

  });
});

// Quit the app if all windows are closed
app.on('window-all-closed', () => {
  app.quit();
});
