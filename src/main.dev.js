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
import Store from 'electron-store';
import _ from 'lodash';
import os from 'os';
import path from 'path';
import { createLogger, format, transports } from 'winston';
import MenuBuilder from './menu';
import registerKeyboardShortcuts from './registerKeyboardShortcuts';

//
// Setup file logging with Winston
//
// Logs are saved in the appropriate log folder for the current OS.
//
const baseLogPath = app.getPath('logs');
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(
      info => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.File({
      filename: path.join(baseLogPath, 'error.log'),
      level: 'error'
    }),
    new transports.File({
      filename: path.join(baseLogPath, 'combined.log'),
    }),
  ]
});

// Local data persistence store
const store = new Store();

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
    logger.info('Window - Delay triggered');
    mainWindow.webContents.send('navigate', '/delay-start');
    const launchDelay = launchDelayCustom || 30;
    // After delay, load settings URL
    setTimeout(() => {
      mainWindow.loadURL(mainWindowURL);
    }, launchDelay * 1000);
  } else {
    // Immediately navigate to settings URL
    logger.info('Window - Immediately loading settings URL');
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
  store.set('kiosk.launching', 1);
  const reactHome = `file://${__dirname}/index.html`;
  const mainWindowURL = _.get(store.get('kiosk'), 'displayHome', reactHome);

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
  logger.info('Window - New browser window');

  // Log console messages in the render process
  if (process.env.LOG_RENDER_CONSOLE === 'true') {
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      const levels = {
        0: 'Info',
        1: 'Warning',
        2: 'Error',
      };
      const getLevel = (numberLevel) => _.has(levels, numberLevel.toString())
        ? levels[numberLevel]
        : 'Unknown';
      logger.info(`Render-${getLevel(level)} - ${message} - ${sourceId}:${line}`);
    });
  }

  // Start by loading the React home page
  mainWindow.loadURL(reactHome);
  logger.info('Window - Load React home');

  // Once our react app has mounted, we can load kiosk content
  ipcMain.on('routerMounted', () => {
    if (store.get('kiosk.launching', 1)) {
      logger.info('Window - React router mounted');
      if (_.has(store.get('kiosk'), 'displayHome')) {
        logger.info('Window - URL set, checking delay');
        loadWindowUptimeDelay(mainWindow, mainWindowURL);
        // Done launching
        store.set('kiosk.launching', 0);
      } else {
        logger.info('Window - No URL set, sending React to settings page');
        mainWindow.webContents.send('navigate', '/settings');
      }
    }
  });

  //
  // Update settings from the client using IPC
  //
  ipcMain.on('updateSettings', (event, arg) => {
    store.set('kiosk.displayHome', arg.url);
    mainWindow.loadURL(arg.url);
  });

  ipcMain.on('settingsGet', (event) => {
    /* eslint no-param-reassign: off */
    event.returnValue = store.get('kiosk.displayHome');
  });

  // Setup keyboard shortcuts
  registerKeyboardShortcuts(mainWindow, reactHome);

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
