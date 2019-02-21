import { app, globalShortcut } from 'electron';
import childProcess from 'child_process';
import navigateSettings from '../navigate';

// In production we don't set a menu because it interfeers with full screen kiosk mode in
// various operating systems. Since our menu roles define the keyboard shortcuts for the
// application we need to manually define them here for the production app.
const buildShortcutsProd = (mainWindow, appHome, store) => {
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
    navigateSettings(mainWindow, appHome, store);
  });
  // Reload
  globalShortcut.register('CommandOrControl+R', () => {
    mainWindow.webContents.reload();
  });
  // Hide window
  globalShortcut.register('CommandOrControl+H', () => {
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
      : 'Command+Option+I';
    globalShortcut.register(devToolsOSShortcut, () => {
      mainWindow.webContents.openDevTools();
    });
  }

  // Quit
  globalShortcut.register('CommandOrControl+Q', () => {
    app.quit();
  });
};

export default buildShortcutsProd;
