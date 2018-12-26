//
// Replicate menu keyboard shortcuts in kiosk mode
//
// On Windows and Linux, we can't build a menu in kiosk mode, because it shows up to the user
// even when the window is in fullscreen kiosk mode. So we manually construct the common
// keyboard shortcuts that we want to enable in kiosk mode.
//
import { globalShortcut } from 'electron';
import navigateSettings from './navigate'

const buildShortcuts = (window, reactHome) => {
  // Undo
  globalShortcut.register(null, 'CommandOrControl+Z', () => {
    window.webContents.undo();
  });
  // Redo
  globalShortcut.register(null, 'CommandOrControl+Shift+Z', () => {
    window.webContents.redo();
  });
  // Cut
  globalShortcut.register(null, 'CommandOrControl+X', () => {
    window.webContents.cut();
  });
  // Copy
  globalShortcut.register(null, 'CommandOrControl+C', () => {
    window.webContents.copy();
  });
  // Paste
  globalShortcut.register(null, 'CommandOrControl+V', () => {
    window.webContents.paste();
  });
  // Select all
  globalShortcut.register(null, 'CommandOrControl+A', () => {
    window.webContents.selectAll();
  });
  globalShortcut.register(null, 'CommandOrControl+,', () => {
    navigateSettings(window, reactHome)
  });
};

export default buildShortcuts;
