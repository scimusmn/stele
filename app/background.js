/**
 * Background
 *
 * This is main Electron process, started first thing when your app launches.
 * This script runs through entire life of your application. It doesn't have
 * any windows that you can see on screen, but we can open windows from here.
 */

// Base electron modules
import { app, BrowserWindow } from 'electron';

// Development helper for showing Chromium Dev Tools
import devHelper from './vendor/electron_boilerplate/dev_helper';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

var mainWindow;

app.on('ready', function() {

  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
  });

  /**
   * Hack to make fullscreen kiosk mode actually work.
   *
   * There is an active bug with Electron, kiosk mode, and Yosemite.
   * https://github.com/atom/electron/issues/1054
   * This hack makes kiosk mode actually work by waiting for the app to launch
   * and then issuing a call to go into kiosk mode after a few milliseconds.
   */
  if (env.name == 'production') {
    setTimeout(function() {
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

  if (env.name === 'test') {
    mainWindow.loadURL('file://' + __dirname + '/spec.html');
  } else {
    mainWindow.loadURL('file://' + __dirname + '/app.html');
  }

});

app.on('window-all-closed', function() {
  app.quit();
});
