import { app, Menu, shell } from 'electron';
import { navigateSettings } from '../windows/navigate';
import buildShortcutsMac from './buildShortcutsDev';
import buildShortcutsProd from './buildShortcutsProd';

const menuBuild = (window, reactHome, store) => {
  const menuTemplate = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Documentation',
          click() {
            shell.openExternal(
              'https://github.com/scimusmn/stele#readme',
            );
          },
        },
        {
          label: 'Report issues',
          click() {
            shell.openExternal('https://github.com/scimusmn/stele/issues');
          },
        },
      ],
    },
  ];

  //
  // macOS
  //
  // Add macOS specific Menu items and roles that define keyboard shortcuts
  if (process.platform === 'darwin') {
    menuTemplate.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'Command+,',
          click: (() => {
            navigateSettings(window, reactHome, store);
          }),
        },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });

    // Edit menu
    menuTemplate[1].submenu.push(
      { type: 'separator' },
      {
        label: 'Speech',
        submenu: [
          { role: 'startspeaking' },
          { role: 'stopspeaking' },
        ],
      },
    );

    // Window menu
    menuTemplate[3].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'front' },
    ];
  } else {
    //
    // Windows & Linux
    //
    menuTemplate[2].submenu.push(
      {
        label: 'Preferences...',
        accelerator: 'Control+,',
        click: (() => {
          navigateSettings(window, reactHome, store);
        }),
      },
    );
  }

  return Menu.buildFromTemplate(menuTemplate);
};

//
// Handle OS unique menu behaviors for production kiosk app
//
// Windows & Linux: The kiosk mode in these environments shows the menu. We don't want this in
//   kiosk mode. These OSes will also tolerate running an app with no menu.
// macOS: macOS (aka Darwin) both hides the menu in kiosk mode and also requires the menu to be
//   defined so that the app window will render. So we let this fall through and set the menu.
//
const buildMenuShortcuts = (mainWindow, appHome, store) => {
  if (process.env.NODE_ENV === 'development') {
    Menu.setApplicationMenu(menuBuild(mainWindow, appHome, store));
  }
  if (process.platform === 'darwin') {
    buildShortcutsMac();
  }
  if (process.env.NODE_ENV !== 'development') {
    buildShortcutsProd(mainWindow, appHome, store);
  }
};

export default buildMenuShortcuts;
