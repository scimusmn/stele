//
// Replicate menu keyboard shortcuts in kiosk mode
//
// On Windows and Linux, we can't build a menu, because it shows up to the user
// even when the window is in fullscreen kiosk mode. So we manually construct the common
// keyboard shortcuts that we want to enable in kiosk mode.
//
import electronLocalshortcut from 'electron-localshortcut';
import navigateSettings from './navigate';

const buildShortcutsLocal = (window, reactHome) => {
  // Undo
  electronLocalshortcut.register(null, 'CommandOrControl+Z', () => {
    window.webContents.undo();
  });
  // Redo
  electronLocalshortcut.register(null, 'CommandOrControl+Shift+Z', () => {
    window.webContents.redo();
  });
  // Cut
  electronLocalshortcut.register(null, 'CommandOrControl+X', () => {
    window.webContents.cut();
  });
  // Copy
  electronLocalshortcut.register(null, 'CommandOrControl+C', () => {
    window.webContents.copy();
  });
  // Paste
  electronLocalshortcut.register(null, 'CommandOrControl+V', () => {
    window.webContents.paste();
  });
  // Select all
  electronLocalshortcut.register(null, 'CommandOrControl+A', () => {
    window.webContents.selectAll();
  });
  electronLocalshortcut.register(null, 'CommandOrControl+,', () => {
    navigateSettings(window, reactHome)
  });
};

export default buildShortcutsLocal;
