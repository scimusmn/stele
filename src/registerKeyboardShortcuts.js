import childProcess from 'child_process';
import { app, globalShortcut, ipcMain } from 'electron';
import log from 'electron-log';

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
const registerKeyboardShortcuts = (mainWindow, reactHome) => {

  // Setup child processes for keyboard shortcuts
  const promisedExec = childProcess.exec;

  // Quit shortcut
  globalShortcut.register('CmdOrCtrl+Q', () => {
    app.quit();
  });

  // Reload shortcut
  globalShortcut.register('CmdOrCtrl+R', () => {
    mainWindow.webContents.reload();
  });

  globalShortcut.register('Command+,', () => {
    // Navigate to delay message during delay period
    log.info('Window - Navigating to Settings with keyboard shortcut');
    // TODO: Make this a function
    // Make this little bit a function that you can import and reuse
    mainWindow.loadURL(reactHome);
    ipcMain.on('routerMounted', () => {
      mainWindow.webContents.send('navigate', '/settings');
    });
  });

  // Switch to desktop
  globalShortcut.register('Control+F', () => {
    console.log('Switching to Finder');
    promisedExec('open -a Finder');
  });

};

export default registerKeyboardShortcuts;
