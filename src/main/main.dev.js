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
  app, BrowserWindow, globalShortcut, ipcMain, screen,
} from 'electron';
import Store from 'electron-store';
import _ from 'lodash';
import setupDevelopmentEnvironment from './devTools';
import logger from './logger';
import installExtensions from './extensions';
import autoLaunch from './autoLaunch';
import buildMenuShortcuts from './menu/buildMenuShortcuts';
import handleCursor from './cursor';
import { loadWindow, loadWindowNow } from './loadWindow';

//
// Globals
//
// We need a global delay timer so that other spawned actions can reset it on user action.
global.delayTimer = null;

// Setup local data store
const store = new Store();

// Setup stack traces in production
if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

app.on('ready', async () => {
  // Set a boolean for the browsing state. We want to register when the app is looking at the
  // configured content, or when it is on one of the internal settings page. This is primarily
  // used to help with cursor and window lock-down that we want to disable on settings pages.
  store.set('kiosk.browsingContent', 0);

  //
  // Get display information
  //
  // Primary display
  const displaysPrimary = screen.getPrimaryDisplay();
  store.set('kiosk.displayPrimaryID', displaysPrimary.id);
  // All displays
  const displaysAll = screen.getAllDisplays();
  logger.info(`Displays - ${displaysAll.length} displays connected.`);
  _.forEach(displaysAll, (display, index) => {
    logger.info(
      `Displays - Display ${index + 1}${display.id === displaysPrimary.id
        ? ' (Primary) '
        : ' '}- ${display.size.width} x ${display.size.height}`,
    );
  });

  // Store display info on startup
  store.set('kiosk.displayCount', displaysAll.length);

  // Get the displays registered in the app settings
  const settingDisplaysInitial = _.get(store.get('kiosk'), 'displays');

  //
  // Handle fresh settings
  //
  // If we're starting the app for the first time the displays setting will be blank
  // in the data store. Create the display settings with our screen information
  // and add a blank URL item.
  if (settingDisplaysInitial == null) {
    console.log('Setting kiosk.displays');
    store.set(
      'kiosk.displays',
      _.map(displaysAll, item => _.extend({}, item, { connected: true, enabled: true, url: '' })),
    );
  } else {
    //
    // Handle existing settings
    //
    // If some displays are already configured in the app, we need to evaluate whether the
    // configured displays match the hardware connected to the computer.
    // Start by setting all displays to disconnected
    // const settingDisplaysIntermediate = _.get(store.get('kiosk'), 'displays');

    // Build collection of displays that are connected
    const displaysAllConnected = _.map(
      displaysAll,
      item => _.extend({}, item, { connected: true }),
    );
    // Set all settings displays to disconnected, before merging
    const settingsDisplays = _.map(
      settingDisplaysInitial,
      item => _.extend({}, item, { connected: false }),
    );
    const mergedDisplays = _.merge(settingsDisplays, displaysAllConnected);
    store.set('kiosk.displays', mergedDisplays);
  }

  // const settingsDisplays = _.get(store.get('kiosk'), 'displays', _.map(
  //   displaysAll, item => _.extend({}, item, { connected: true, url: '' }),
  // ));

  // TODO: Confirm that this description is correct
  // Set an initial launching state flag.
  // This allows us to wait for the React app to start up and send back a signal that it is ready
  // to navigate to the appropriate path.
  store.set('kiosk.launching', 1);
  const appHome = `file://${__dirname}/../renderer/index.html`;
  // const mainWindowURL = _.get(store.get('kiosk'), 'displayHome', reactHome);

  // Setup browser extensions
  await installExtensions();

  // Setup default window size
  const mainWindow = new BrowserWindow({
    show: false,
    width: (displaysPrimary.size.width),
    height: (displaysPrimary.size.height),
  });
  logger.info('Window - New browser window');

  //
  // Respond to failed window loads
  //
  // If the error is about an invalid URL, return the user to the settings page.
  // Otherwise, log an error and quit Stele.
  //
  mainWindow.webContents.on(
    'did-fail-load', (event, errorCode, errorDescription) => {
      if (
        errorDescription === 'ERR_INVALID_URL'
        || errorDescription === 'ERR_NAME_NOT_RESOLVED'
      ) {
        const configuredURL = _.get(store.get('kiosk'), 'displayHome');
        logger.info(
          `App - Stele is configured to load an invalid URL(${configuredURL}) - ${errorDescription}:${errorCode}`,
        );
        store.set('kiosk.browsingContent', 0);
        mainWindow.loadURL(appHome);
        ipcMain.on('routerMounted', () => {
          mainWindow.webContents.send('navigate', '/settings');
        });
      } else {
        logger.error(`App - Unknown web contents load failure - ${errorDescription}:${errorCode}`);
        app.quit();
      }
    },
  );

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

  // Log console messages in the render process
  if (process.env.LOG_RENDER_CONSOLE === 'true') {
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      const levels = {
        0: 'Info',
        1: 'Warning',
        2: 'Error',
      };
      const getLevel = numberLevel => (_.has(levels, numberLevel.toString())
        ? levels[numberLevel]
        : 'Unknown');
      logger.info(`Render-${getLevel(level)} - ${message} - ${sourceId}:${line}`);
    });
  }

  // Start by loading the React home page
  store.set('kiosk.browsingContent', 1);
  mainWindow.loadURL(appHome);
  logger.info(`Window - Load React home - ${appHome}`);

  // Once our react app has mounted, we can load kiosk content
  ipcMain.on('routerMounted', () => {
    if (store.get('kiosk.launching', 1)) {
      logger.info('Window - React router mounted');
      if (_.get(store.get('kiosk'), 'displays[0].url') !== '') {
        logger.info('Window - Display URLs configured, checking delay');
        loadWindow(mainWindow, store);
        // Done launching
        store.set('kiosk.launching', 0);
      } else {
        logger.info('Window - No URL set, sending React to settings page');
        mainWindow.webContents.send('navigate', '/settings');
      }
    }
  });

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
    autoLaunch(store.get('kiosk.autoLaunch'), logger);
  });

  ipcMain.on('settingsGet', (event) => {
    /* eslint no-param-reassign: off */
    event.returnValue = store.get('kiosk');
  });

  // Setup application menu and menu-based keyboard shortcuts
  if (process.env.NODE_ENV === 'development') {
    setupDevelopmentEnvironment(mainWindow);
  }

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
});

// Quit the app if all windows are closed
app.on('window-all-closed', () => {
  app.quit();
});

// Unregister all shortcuts when the app exits.
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
