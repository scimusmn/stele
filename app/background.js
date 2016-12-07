/**
 * Background
 *
 * This is main Electron process, started first thing when your app launches.
 * This script runs through entire life of your application. It doesn't have
 * any windows that you can see on screen, but we can open windows from here.
 */

import jetpack from 'fs-jetpack';

// Base electron modules
import { app, BrowserWindow, globalShortcut } from 'electron';

let childProcess = require('child_process');
let promisedExec = childProcess.exec;

// Development helper for showing Chromium Dev Tools
import devHelper from './vendor/electron_boilerplate/dev_helper';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

import os from 'os';

let mainWindow;
app.on('ready', function () {

  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
  });

  /**
   * Hack to make full-screen kiosk mode actually work.
   *
   * There is an active bug with Electron, kiosk mode, and Yosemite.
   * https://github.com/atom/electron/issues/1054
   * This hack makes kiosk mode actually work by waiting for the app to launch
   * and then issuing a call to go into kiosk mode after a few milliseconds.
   */
  if (env.name == 'production') {
    setTimeout(function () {
      mainWindow.setKiosk(true);
    }, 100);
  }

  /**
   * Show dev tools when we're not in production mode
   */
  if (env.name !== 'production') {
    devHelper.setDevMenu();
    mainWindow.openDevTools();
  }

  /**
   * Open the app
   */
  if (env.name === 'test') {
    mainWindow.loadURL('file://' + __dirname + '/spec.html');
  } else {
    const configFile = '/usr/local/etc/kiosk/config.json';
    loadWindowConfigFile(configFile);
  }

  /**
   * Keyboard shortcuts
   *
   * Ctrl or Command + f will switch you to the Finder.
   * We use the "switch to Finder" approach instead of a quit, because in most
   * of our Electron setups we have a launchd process that will relaunch the
   * app on quit. For maintenance, we probably just need to be able to get
   * to the Finder while the application remains running in the background.
   */
  const retQuit = globalShortcut.register('CommandOrControl+F', () => {
    console.log('Switching to Finder');
    promisedExec('open -a Finder');
  });
  if (!retQuit) {
    console.log('Quit keyboard registration failed');
  }
  const retReload = globalShortcut.register('CommandOrControl+R', () => {
    console.log('Reload the page');
    mainWindow.reload();
  });
  if (!retReload) {
    console.log('Reload keyboard registration failed');
  }

});

function loadWindowConfigFile(configFile) {
  const configFileObj = jetpack.read(configFile, 'json');
  console.log('configFileObj: ', configFileObj);
  if (configFileObj !== null) {
    loadWindowUptimeDelay(configFileObj);
  } else {
    console.log('Config file [' + configFile + '] not present.');
    mainWindow.loadURL('file://' + __dirname + '/config-error.html');
  }
}

function loadWindowUptimeDelay(configFileObj) {
  // Seconds since launch, when it will be safe to load the URL
  const nominalUptime = 300;

  // Seconds to wait if we are not in the nominal uptime window
  const launchDelay = 60;

  console.log('os.uptime(): ', os.uptime());
  console.log('nominalUptime: ', nominalUptime);

  if (os.uptime() > nominalUptime) {
    console.log('Launching immediately');
    mainWindow.loadURL(configFileObj.url);
  } else {
    console.log('Delaying launch ' + launchDelay + ' seconds');
    mainWindow.loadURL('file://' + __dirname + '/launch-delay.html');
    setTimeout(function () {
      mainWindow.loadURL(configFileObj.url);
    }, launchDelay * 1000);
  }

}

app.on('window-all-closed', function () {
  app.quit();
});
