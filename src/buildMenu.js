import {
  app, Menu, ipcMain, shell,
} from 'electron';
import log from 'electron-log';

const navigateSettings = (window, reactHome) => {
  // Navigate to delay message during delay period
  log.info('Window - Navigating to Settings with keyboard shortcut');
  // TODO: Make this a function
  // Make this little bit a function that you can import and reuse
  window.loadURL(reactHome);
  ipcMain.on('routerMounted', () => {
    clearTimeout(global.delayTimer);
    window.webContents.send('navigate', '/settings');
  });
};

const buildMenu = (window, reactHome) => {
  const template = [
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

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'Command+,',
          click: (() => {
            navigateSettings(window, reactHome);
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
    template[1].submenu.push(
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
    template[3].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'front' },
    ];
  } else {
    template[2].submenu.push(
      {
        label: 'Preferences...',
        accelerator: 'Control+,',
        click: (() => {
          navigateSettings(window, reactHome);
        }),
      },
    );
  }

  return Menu.buildFromTemplate(template);
};

export default buildMenu;
