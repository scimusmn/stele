import { app } from 'electron';
import electronLocalshortcut from 'electron-localshortcut';
import childProcess from 'child_process';
import _ from 'lodash';
import { navigateSettings } from '../navigate';

//
// In production we don't set a menu because it interferes with full screen kiosk mode in
// various operating systems. Since our menu roles define the keyboard shortcuts for the
// application we need to manually define them here for the production app.
//
// We use a 3rd party tool to create shortcuts since we don't want these to work globally.
//
const buildShortcutsProd = (mainWindow, appHome, store) => {
  // Undo
  electronLocalshortcut.register('CommandOrControl+Z', () => {
    mainWindow.webContents.undo();
  });
  // Redo
  electronLocalshortcut.register('CommandOrControl+Shift+Z', () => {
    mainWindow.webContents.redo();
  });
  // Cut
  electronLocalshortcut.register('CommandOrControl+X', () => {
    mainWindow.webContents.cut();
  });
  // Copy
  electronLocalshortcut.register(mainWindow, 'CommandOrControl+C', () => {
    mainWindow.webContents.copy();
  });
  // Paste
  electronLocalshortcut.register('CommandOrControl+V', () => {
    mainWindow.webContents.paste();
  });
  // Select all
  electronLocalshortcut.register('CommandOrControl+A', () => {
    mainWindow.webContents.selectAll();
  });
  // Settings
  electronLocalshortcut.register('CommandOrControl+,', () => {
    navigateSettings(mainWindow, appHome, store);
  });
  // Reload
  electronLocalshortcut.register('CommandOrControl+R', () => {
    mainWindow.webContents.reload();
  });
  // Hide window
  electronLocalshortcut.register('CommandOrControl+H', () => {
    if (process.platform === 'linux') {
      childProcess.exec('nautilus');
    } else {
      mainWindow.blur();
    }
  });

  // Dev tools - Optional shortcut, enabled via Settings
  const devToolsShortcutSetting = _.get(store.get('kiosk'), 'devToolsShortcut');

  if (devToolsShortcutSetting) {
    const devToolsOSShortcut = process.platform === 'darwin'
      ? 'Command+Option+I'
      : 'Control+Shift+I';
    electronLocalshortcut.register(devToolsOSShortcut, () => {
      mainWindow.webContents.openDevTools();
    });
  }

  // Quit
  electronLocalshortcut.register('CommandOrControl+Q', () => {
    app.quit();
  });
};

export default buildShortcutsProd;
