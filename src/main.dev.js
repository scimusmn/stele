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
  app, BrowserWindow, ipcMain, globalShortcut, Menu,
} from 'electron';
import Store from 'electron-store';
import _ from 'lodash';
import os from 'os';
import path from 'path';
import childProcess from 'child_process';
import { createLogger, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import buildMenu from './buildMenu';
import setupDevelopmentEnvironment from './devTools';
import navigateSettings from './navigate';
import { autoLaunchApp } from './startupHelpers';

const promisedExec = childProcess.exec;

// Setup global timer container
global.delayTimer = null;

//
// Setup file logging with Winston
//
// Logs are saved in the appropriate log folder for the current OS and rotated daily.
//
// Electron's getPath helper isn't working for Ubuntu Linux right now:
// https://github.com/electron/electron/issues/15877
// So we manually configure the ~/.config/Stele/ folder the standard app logging folder.
//
const baseLogPath = process.platform === 'linux'
  ? path.join(os.homedir(), '.config', app.getName())
  : app.getPath('logs');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(
      info => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(baseLogPath, 'log-%DATE%.log'),
      datePattern: 'YYYY-MM-DD-HH',
      maxSize: '20m',
      maxFiles: '90d',
    }),
  ],
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
      extensions.map(name => installer.default(installer[name], forceDownload)),
    )
    .catch(console.log);
};

//
// Lookup the delay time environment variable
//
// Return NaN if set and not transformable to a number.
// Returns 0 if the environment variable is not set
// Returns an optional defaultSeconds if the environment variable is not set
//
function getDelayTime(defaultSeconds) {
  return process.env.STELE_DELAY ? process.env.STELE_DELAY * 1 : defaultSeconds || 0;
}

// Check whether the computer has been up long enough to start the configured URL
// If we just started up returns false
function checkUptime(nominalUptime) {
  // Seconds since launch, when it will be safe to load the URL
  const nominalUptimeValue = nominalUptime || 300;
  return !(os.uptime() < nominalUptimeValue);
}

// Load the configured kiosk URL after a configured delay.
function loadWindowDelay(mainWindow, mainWindowURL) {
  // We set a default here to ensure that we pass a required delay time to the route
  // even if this gets called with an invalid delay time.
  const delayTime = getDelayTime(30);
  logger.info('Window - Delay triggered');
  mainWindow.webContents.send('navigate', '/delay-start', delayTime);
  // After delay, load settings URL
  global.delayTimer = setTimeout(() => {
    mainWindow.loadURL(mainWindowURL);
  }, delayTime * 1000);
}

// Load the configured kiosk URL immediately.
function loadWindowNow(mainWindow, mainWindowURL) {
  logger.info(`Window - Immediately loading settings URL: ${mainWindowURL}`);
  mainWindow.loadURL(mainWindowURL);
}

// Load the appropriate content in the kiosk window based on environment and config settings
function loadWindow(mainWindow, mainWindowURL) {
  if (process.env.NODE_ENV === 'development') {
    const delayTime = getDelayTime();
    // In dev we only set a delay if it's explicitly set as an environment variable and
    // it's a real number greater than 0.
    if (_.isFinite(delayTime) && delayTime > 0) {
      loadWindowDelay(mainWindow, mainWindowURL);
    } else {
      loadWindowNow(mainWindow, mainWindowURL);
    }
  }
  if (process.env.NODE_ENV !== 'development' && !checkUptime()) {
    loadWindowDelay(mainWindow, mainWindowURL);
  } else {
    loadWindowNow(mainWindow, mainWindowURL);
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
    process.env.NODE_ENV === 'development'
    || process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  // Setup default window size
  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
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
      if (_.has(store.get('kiosk'), 'displayHome')) {
        logger.info('Window - URL set, checking delay');
        loadWindow(mainWindow, mainWindowURL);
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
    mainWindow.loadURL(mainWindowURL);
  });

  //
  // Update settings from the client using IPC
  //
  ipcMain.on('updateSettings', (event, arg) => {
    store.set({
      'kiosk.displayHome': arg.url,
      'kiosk.cursorVisibility': arg.cursorVis,
      'kiosk.autoLaunch': arg.autoLaunch,
    });
    mainWindow.loadURL(arg.url);
    autoLaunchApp(store.get('kiosk.autoLaunch'));
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
