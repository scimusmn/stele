import { app } from 'electron';
import electronLocalshortcut from 'electron-localshortcut';
import childProcess from 'child_process';

// Set shortcuts for alternate quit and hide keyboard shortcuts on the Mac
// These are useful when remotely controlling the computer. In this situation the traditional
// app shortcuts often don't come through to Stele because they are captured with the
// remote control application. This provides an alternate way to quit or hide the app
// in this situation.
const buildShortcutsMac = () => {
  electronLocalshortcut.register('Control+Q', () => {
    app.quit();
  });

  // macOS - Define a shortcut for hiding the application
  // See note in application documentation
  // This keyboard shortcut is handles by menu roles on Windows and Linux
  if (process.platform === 'darwin') {
    electronLocalshortcut.register('Control+H', () => {
      childProcess.exec('open -a Finder ~/');
    });
  }
};

export default buildShortcutsMac;
