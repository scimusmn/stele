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
  app, BrowserWindow, globalShortcut, ipcMain, Menu, screen,
} from 'electron';
import Store from 'electron-store';
import _ from 'lodash';
import childProcess from 'child_process';
import { getDelayTime, checkUptime } from './delay';
import buildMenu from './buildMenu';
import setupDevelopmentEnvironment from './devTools';
import navigateSettings from './navigate';
import logger from './logger';
import installExtensions from './extensions';

// Setup global timer container
global.delayTimer = null;

// Setup local execution
const promisedExec = childProcess.exec;

// Setup local data store
const store = new Store();

// Setup stack traces in production
if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

// Setup useful Electron debug features in development
if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
}

// Load the configured kiosk URL immediately.
function loadWindowNow(mainWindow, storeDisplays) {
  // logger.info(`Window - Immediately loading settings URL: ${mainWindowURL}`);
  mainWindow.loadURL(storeDisplays[0].url);
  const secondaryWindows = [];
  const allDisplays = screen.getAllDisplays();
  if (storeDisplays.length > 1) {
    _.forEach(storeDisplays, (display, index) => {
      if (index !== 0) {
        // TODO: Make this work for more than two displays
        // Right now this will only correctly position a display on the 2nd display
        secondaryWindows[index] = new BrowserWindow({
          x: allDisplays[index].bounds.x,
          y: 0,
          show: false,
        });
        secondaryWindows[index].loadURL(storeDisplays[index].url);
        secondaryWindows[index].once('ready-to-show', () => {
          secondaryWindows[index].show();
        });
      }
    });
  }
}

// Load the configured kiosk URL after a configured delay.
function loadWindowDelay(mainWindow, storeDisplays) {
  // We set a default here to ensure that we pass a required delay time to the route
  // even if this gets called with an invalid delay time.
  const delayTime = getDelayTime(30);
  logger.info('Window - Delay triggered');
  mainWindow.webContents.send('navigate', '/delay-start', delayTime);
  // After delay, load settings URL
  global.delayTimer = setTimeout(() => {
    loadWindowNow(mainWindow, storeDisplays);
  }, delayTime * 1000);
}

// Load the appropriate content in the kiosk window based on environment and config settings
function loadWindow(mainWindow, storeDisplays) {
  if (process.env.NODE_ENV === 'development') {
    const delayTime = getDelayTime();
    // In dev we only set a delay if it's explicitly set as an environment variable and
    // it's a real number greater than 0.
    if (_.isFinite(delayTime) && delayTime > 0) {
      loadWindowDelay(mainWindow, storeDisplays);
    } else {
      loadWindowNow(mainWindow, storeDisplays);
    }
  }
  if (process.env.NODE_ENV !== 'development') {
    if (!checkUptime()) {
      loadWindowDelay(mainWindow, storeDisplays);
    } else {
      loadWindowNow(mainWindow, storeDisplays);
    }
  }
}

app.on('ready', async () => {
  //
  // Get display information
  //
  // Primary display
  const displaysPrimary = screen.getPrimaryDisplay();
  const displaysAll = screen.getAllDisplays();
  logger.info(`Displays - ${displaysAll.length} displays connected.`);
  _.forEach(displaysAll, (display, index) => {
    logger.info(
      `Displays - Display ${index + 1}${display.id === displaysPrimary.id
        ? ' (Primary) '
        : ' '}- ${display.size.width} x ${display.size.height}`,
    );
  });

  //
  // TODO: Check the displays against the config
  // Don't delete configured URLs
  //
  // const displaySizes = _.map(displaysAll, _.partialRight(_.pick, ['id', 'size']));
  // store.set('kiosk.displayCount', displaysAll.length);
  // // Fake displays value during development
  // // change this back to `displays` after you get the react form working
  // const tempUrls = ['http://www.example.com', 'https://en.wikipedia.org/wiki/Main_Page'];
  // const displays = _.forEach(
  //   displaySizes, (display, index) => _.assignIn(display, { url: tempUrls[index] }),
  // );
  // store.set('kiosk.displays', displays);

  store.set('kiosk.displayPrimaryID', displaysPrimary.id);

  //
  // Lookup settings
  //
  // Default the app to the settings input page if app values aren't set.
  //
  store.set('kiosk.launching', 1);
  const reactHome = `file://${__dirname}/index.html`;

  // Get display configuration from the settings
  // If a display config isn't present load the default reactHome for Settings init
  const storeDisplays = _.get(store.get('kiosk'), 'displays', [{ enabled: true, reactHome }]);

  // const mainWindowURL = _.get(store.get('kiosk'), 'displayHome', reactHome);

  // Setup browser extensions
  await installExtensions();

  // Setup default window size
  const mainWindow = new BrowserWindow({
    show: false,
    width: (displaysPrimary.size.width / 2),
    height: ((displaysPrimary.size.height / 3) * 2),
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
        mainWindow.loadURL(reactHome);
        ipcMain.on('routerMounted', () => {
          mainWindow.webContents.send('navigate', '/settings');
        });
      } else {
        logger.error(`App - Unknown web contents load failure - ${errorDescription}:${errorCode}`);
        app.quit();
      }
    },
  );

  // Do any necessary js/css injections after load
  mainWindow.webContents.on('did-finish-load', () => {
    const contents = mainWindow.webContents;
    const { history } = contents;
    const currentURL = history[history.length - 1];

    // Ensure we are on our target kiosk URL
    if (currentURL.indexOf(reactHome) === -1) {
      const hideCursor = store.get('kiosk.cursorVisibility');
      let inactivityDelay = 0;
      const hideCursorCSS = 'html, body, *{ cursor: none !important;}';

      switch (hideCursor) {
        case 'show':
          // Do nothing. Use default cursor styles.
          break;
        case 'hide':
          contents.insertCSS(hideCursorCSS);
          break;
        case 'hide_after_5':
          inactivityDelay = 5000;
        // Falls through
        case 'hide_after_60':
          if (inactivityDelay === 0) inactivityDelay = 60000;
          // Javascript injection for timed cursor hiding...
          /* eslint no-case-declarations: off */
          let js = 'let eCursorTimeout = {}; ';
          js += 'const eStylesheet = document.styleSheets[0]; ';
          js += `let eRuleIndex = eStylesheet.insertRule("${hideCursorCSS}", 0); `;
          js += 'window.addEventListener("mousemove", () => { ';
          js += 'clearTimeout(eCursorTimeout); ';
          js += 'if (eRuleIndex >= 0) { eStylesheet.deleteRule(eRuleIndex); eRuleIndex = -1; } ';
          js += 'eCursorTimeout = setTimeout( () => { ';
          js += `eRuleIndex = eStylesheet.insertRule("${hideCursorCSS}", 0); `;
          js += `}, ${inactivityDelay}`;
          js += ') }, true)';
          contents.executeJavaScript(js);
          break;
        default:
          console.warn('[Warning] Cursor visibility selection not recognized.');
      }
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
  mainWindow.loadURL(reactHome);
  logger.info('Window - Load React home');

  // Once our react app has mounted, we can load kiosk content
  ipcMain.on('routerMounted', () => {
    if (store.get('kiosk.launching', 1)) {
      logger.info('Window - React router mounted');
      if (_.has(store.get('kiosk'), 'displays')) {
        logger.info('Window - Display URLs configured, checking delay');
        loadWindow(mainWindow, storeDisplays);
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
    loadWindowNow(mainWindow, storeDisplays);
  });

  //
  // Update settings from the client using IPC
  //
  ipcMain.on('updateSettings', (event, arg) => {
    store.set({
      'kiosk.displays': arg.displays,
      'kiosk.cursorVisibility': arg.cursorVis,
    });
    const updatedStoreDisplays = _.get(
      store.get('kiosk'),
      'displays',
      [{ enabled: true, reactHome }],
    );
    loadWindowNow(mainWindow, updatedStoreDisplays);
  });

  ipcMain.on('settingsGet', (event) => {
    /* eslint no-param-reassign: off */
    event.returnValue = store.get('kiosk');
  });

  // Setup application menu and menu-based keyboard shortcuts
  if (
    process.env.NODE_ENV === 'development'
    || process.env.DEBUG_PROD === 'true'
  ) {
    setupDevelopmentEnvironment(mainWindow);
  }

  //
  // Handle OS unique menu behaviors for production kiosk app
  //
  // Windows & Linux: The kiosk mode in these environments shows the menu. We don't want this in
  //   kiosk mode. These OSes will also tolerate running an app with no menu.
  // macOS: macOS (aka Darwin) both hides the menu in kiosk mode and also requires the menu to be
  //   defined so that the app window will render. So we let this fall through and set the menu.
  //
  if (
    process.env.NODE_ENV === 'development'
    || (
      process.env.NODE_ENV !== 'development'
      && process.platform === 'darwin'
    )
  ) {
    Menu.setApplicationMenu(buildMenu(mainWindow, reactHome));
    // Set shortcuts for alternate quit and hide keyboard shortcuts on the Mac
    // These are useful when remotely controlling the computer. In this situation the traditional
    // app shortcuts often don't come through to Stele because they are captured with the
    // remote control application. This provides an alternate way to quit or hide the app
    // in this situation.
    globalShortcut.register('Control+Q', () => {
      app.quit();
    });
    globalShortcut.register('Control+H', () => {
      promisedExec('open -a Finder ~/');
    });
  } else {
    // Undo
    globalShortcut.register('CommandOrControl+Z', () => {
      mainWindow.webContents.undo();
    });
    // Redo
    globalShortcut.register('CommandOrControl+Shift+Z', () => {
      mainWindow.webContents.redo();
    });
    // Cut
    globalShortcut.register('CommandOrControl+X', () => {
      mainWindow.webContents.cut();
    });
    // Copy
    globalShortcut.register('CommandOrControl+C', () => {
      mainWindow.webContents.copy();
    });
    // Paste
    globalShortcut.register('CommandOrControl+V', () => {
      mainWindow.webContents.paste();
    });
    // Select all
    globalShortcut.register('CommandOrControl+A', () => {
      mainWindow.webContents.selectAll();
    });
    // Settings
    globalShortcut.register('CommandOrControl+,', () => {
      navigateSettings(mainWindow, reactHome);
    });
    // Reload
    globalShortcut.register('CommandOrControl+R', () => {
      mainWindow.webContents.reload();
    });
    // Hide window
    globalShortcut.register('CommandOrControl+H', () => {
      if (process.platform === 'linux') {
        promisedExec('nautilus');
      } else {
        mainWindow.blur();
      }
    });
    // Quit
    globalShortcut.register('CommandOrControl+Q', () => {
      app.quit();
    });
  }

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
