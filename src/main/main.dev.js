/* eslint global-require: off */

//
// This module executes inside of electron's main process. You can start
// electron renderer process from here and communicate with the other processes
// through IPC.
//
// When running `yarn build` or `yarn build-main`, this file is compiled to
// `./app/main.prod.js` using webpack. This gives us some performance wins.
//
import {
  app, BrowserWindow, screen,
} from 'electron';
import Store from 'electron-store';
import setupDevTools from './devTools/setupDevTools';
import logger from './logger/logger';
import logConsole from './logger/logConsole';
import setupExtensions from './devTools/setupExtensions';
import buildMenuShortcuts from './menu/buildMenuShortcuts';
import handleCursor from './cursor/handleCursor';
import handleCookies from './cookies/handleCookies';
import { loadWindows } from './windows/loadWindows';
import handleWindowLoadFail from './windows/handleWindowLoadFail';
import setupDisplays from './displays/setupDisplays';
import serialRelay from './serial/serialRelay';
import handleWindowClose from './windows/handleWindowClose';
import handleWindowShow from './windows/handleWindowShow';
import skipDelay from './ipcHandlers/skipDelay';
import updateSettings from './ipcHandlers/updateSettings';
import settingsGet from './ipcHandlers/settingsGet';

// temp

//
// Globals
//
// We need a global delay timer so that other spawned actions can reset it on user action.
// noinspection JSUndefinedPropertyAssignment
global.delayTimer = null;

// Setup local data store
const store = new Store();

// Setup stack traces in production
if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}


app.on('ready', async () => {
  //
  // App settings setup
  //

  // Set a boolean for the browsing state. We want to register when the app is looking at the
  // configured content, or when it is on one of the internal settings page. This is primarily
  // used to help with cursor and window lock-down that we want to disable on settings pages.
  store.set('kiosk.browsingContent', 0);

  // Set a default value for the quitting flag.
  // See quit logic for explanation.
  store.set('quitting', false);

  // Define React App URI
  store.set('appHome', `file://${__dirname}/../renderer/index.html`);

  // Find connected displays and save them to the store.
  setupDisplays(store, logger);

  //
  // Window setup
  //

  // Setup main window
  // We start with a hidden window, filling the entire primary display
  const mainWindow = new BrowserWindow({
    show: false,
    x: 0,
    y: 0,
    width: (screen.getPrimaryDisplay().size.width),
    height: (screen.getPrimaryDisplay().size.height),
  });

  // Setup menus and keyboard shortcut actions
  buildMenuShortcuts(mainWindow, store);

  // Setup devtools in dev mode
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    setupDevTools(mainWindow);
    await setupExtensions();
  }

  // Setup optional console logging
  logConsole(mainWindow, logger);

  // Load window content
  loadWindows(mainWindow, store);

  //
  // Inter-process communication (IPC) handlers
  //
  skipDelay(logger, store, mainWindow);
  updateSettings(logger, store, mainWindow);
  settingsGet(store);

  //
  // Electron event listeners
  //

  // Show the main window once Electron renders the page 'ready-to-show'
  // This smooths the visual display of the app on loading
  handleWindowShow(mainWindow, logger);

  // Handle Electron's did-fail-load event
  handleWindowLoadFail(mainWindow, store, logger);

  // Hide or show cursor based on app settings
  handleCursor(mainWindow, store);

  // Hide windows instead of closing them
  handleWindowClose(mainWindow, store);

  // Set/update cookies requested from settings screen
  handleCookies(mainWindow, store);

  // Setup ability to pass through serial data
  // to/from renderer process and serial ports.
  serialRelay(logger);
});

// Quit the app if all windows are closed
app.on('window-all-closed', () => {
  app.quit();
});

// Cleanup before quit
app.on('before-quit', () => {
  // Set a flag that lets us close all windows
  store.set('quitting', true);
});
