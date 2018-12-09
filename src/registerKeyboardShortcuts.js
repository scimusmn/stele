import childProcess from 'child_process';
import { globalShortcut, ipcMain } from 'electron';
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
const registerKeyboardShortcuts = () => {

  // Setup child processes for keyboard shortcuts
  const promisedExec = childProcess.exec;

  // Switch to desktop
  globalShortcut.register('Control+F', () => {
    console.log('Switching to Finder');
    promisedExec('open -a Finder');
  });

};

export default registerKeyboardShortcuts;
