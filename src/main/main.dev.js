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
  app, BrowserWindow, ipcMain, screen,
} from 'electron';
import Store from 'electron-store';
import _ from 'lodash';
import setupDevTools from './devTools/setupDevTools';
import logger from './logger/logger';
import logConsole from './logger/logConsole';
import setupExtensions from './devTools/setupExtensions';
import handleAutoLaunch from './autoLaunch/handleAutoLaunch';
import buildMenuShortcuts from './menu/buildMenuShortcuts';
import handleCursor from './cursor/handleCursor';
import { loadWindow, loadWindowNow } from './windows/loadWindow';
import handleWindowLoadFail from './windows/handleWindowLoadFail';
import setupDisplays from './displays/setupDisplays';

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
  const appHome = `file://${__dirname}/../renderer/index.html`;

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

  // Setup devtools in dev mode
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    setupDevTools(mainWindow);
    await setupExtensions();
  }

  //
  // Window event listeners
  //

  // Handle Electron's did-fail-load event
  handleWindowLoadFail(mainWindow, appHome, store, logger);

  // Hide or show cursor based on app settings
  handleCursor(mainWindow, store);

  // Ensure the application window has focus as well as the embedded content
  // will be called on settings page and when url is switched to home url
  mainWindow.webContents.on('dom-ready', () => {
    if (process.env.NODE_ENV === 'production') {
      mainWindow.focus();
      mainWindow.webContents.focus();
    }
  });

  // Setup optional console logging
  logConsole(mainWindow, logger);

  const displays = _.get(store.get('kiosk'), 'displays');
  const enabledConfiguredDisplay = _.find(displays, d => d.enabled && d.url !== '');
  if (enabledConfiguredDisplay) {
    logger.info('Window - Display URLs configured, checking delay');
    loadWindow(mainWindow, store);
  } else {
    // Start by loading the React home page
    store.set('kiosk.browsingContent', 1);
    mainWindow.loadURL(appHome);
    logger.info(`Window - Load React home - ${appHome}`);
  }

  // Navigate to the main URL if the user clicks on the skip delay button on the delay page
  ipcMain.on('skipDelay', () => {
    logger.info('Window - Delay skipped');
    store.set('kiosk.browsingContent', 1);
    loadWindowNow(mainWindow, store);
  });

  //
  // Update settings from the client using IPC
  //
  ipcMain.on('updateSettings', (event, arg) => {
    // Filter out displays that are not connected, and that the user has
    // marked to forget on the settings page.
    const displaysRemembered = _.filter(arg.displays, display => display.forgetting !== true);

    // Save updated settings information in the data store
    store.set({
      'kiosk.displays': displaysRemembered,
      'kiosk.cursorVisibility': arg.cursorVis,
      'kiosk.autoLaunch': arg.autoLaunch,
      'kiosk.devToolsShortcut': arg.devToolsShortcut,
    });
    store.set('kiosk.browsingContent', 1);
    loadWindowNow(mainWindow, store);
    handleAutoLaunch(store.get('kiosk.autoLaunch'), logger);
  });

  ipcMain.on('settingsGet', (event) => {
    /* eslint no-param-reassign: off */
    event.returnValue = store.get('kiosk');
  });

  // Setup menus and keyboard shortcut actions
  buildMenuShortcuts(mainWindow, appHome, store);

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

  //
  // Don't close the main window, just hide it.
  //
  // This allows us to reopen the window for the settings screen even if we're not using
  // the primary display for a content window.
  // We need to check for a flag allowing us to bypass this customization, so that we can
  // close all windows when quitting the app.
  mainWindow.on('close', (event) => {
    if (!store.get('quitting', false)) {
      if (process.env.NODE_ENV === 'production') {
        mainWindow.setKiosk(false);
      }
      mainWindow.hide();
      event.preventDefault();
    }
  });
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
