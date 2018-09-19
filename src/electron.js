//
// Electron main process
//
// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// Windows are launched from here depending on the application state
// These windows browse to the internal React app, or your configured
// external web content.
//
import path from 'path';
import url from 'url';
import { app, Menu, globalShortcut } from 'electron';
import jetpack from 'fs-jetpack';
import os from 'os';
// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import { devMenuTemplate } from './menu/dev_menu_template';
import createWindow from './helpers/window';

const settings = require('electron-settings');

const childProcess = require('child_process');

const promisedExec = childProcess.exec;

const env = {
  name: 'development',
};

const setApplicationMenu = () => {
  if (env.name !== 'production') {
    const menus = [devMenuTemplate];
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
  }
};

//
// Delay app loading until the system has been up for a few seconds
//
function loadWindowUptimeDelay(window, configFileObj) {
  // Seconds since launch, when it will be safe to load the URL
  const nominalUptime = 300;

  // Seconds to wait if we are not in the nominal uptime window
  const launchDelay = 60;

  if (os.uptime() > nominalUptime) {
    console.log('Launching immediately');
    window.loadURL(configFileObj.url);
  } else {
    console.log(`Delaying launch ${launchDelay} seconds`);
    window.loadURL(`file://${__dirname}/launch-delay.html?delay=${launchDelay}`);
    setTimeout(() => {
      window.loadURL(configFileObj.url);
    }, launchDelay * 1000);
  }
}

//
// Read config file and pass app url to the window opener
//
function loadWindowConfigFile(window, configFile) {
  const configFileObj = jetpack.read(configFile, 'json');
  if (configFileObj !== null) {
    loadWindowUptimeDelay(window, configFileObj);
  } else {
    console.log(`Config file [${configFile}] not present.`);
    window.loadURL(
      url.format({
        pathname: path.join(__dirname, 'config-error.html'),
        protocol: 'file:',
        slashes: true,
      }),
    );
  }
}

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
  const userDataPath = app.getPath('userData');
  app.setPath('userData', `${userDataPath} (${env.name})`);
}

app.on('ready', () => {
  //
  // Define default settings
  //
  settings.set('appFocus', { url: null });
  // const theUrl = settings.get('appFocus.url');

  //
  // Define app menus
  //
  setApplicationMenu();

  //
  // Open a window, with an initial default size
  //
  // The createWindow function will save the window position and size
  // from session to session. More windows can be configured by
  // providing more unique names in the first argument.
  //
  const mainWindow = createWindow('main', {
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  //
  // Open window with configured URL
  //
  loadWindowConfigFile(mainWindow, '/usr/local/etc/kiosk/config.json');

  //
  // Load Chrome dev tools in development mode
  //
  if (env.name === 'development') {
    mainWindow.openDevTools();
  }

  //
  // Keyboard shortcuts
  //
  // Ctrl or Command + f will switch you to the Finder.
  // We use the "switch to Finder" approach instead of a quit, because in most
  // of our Electron setups we have a launchd process that will relaunch the
  // app on quit. For maintenance, we probably just need to be able to get
  // to the Finder while the application remains running in the background.
  //
  // TODO: Make this work on Windows and Linux
  //
  globalShortcut.register('CommandOrControl+F', () => {
    console.log('Switching to Finder');
    promisedExec('open -a Finder');
  });

  //
  // Kiosk mode
  //
  // Enable fullscreen kiosk mode in production
  //
  if (env.name === 'production') {
    mainWindow.setKiosk(true);
  }
});

app.on('window-all-closed', () => {
  app.quit();
});
