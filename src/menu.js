import { app, Menu, shell } from 'electron';

export default class MenuBuilder {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
  }

  //
  // Build application menu and define local keyboard shortcuts
  //
  // OS Specific notes:
  // `&` is a specific accelerator in Windows.
  // `_` is a the accelerator on Linux.
  // This allows users to trigger the menu item using Alt+the letter following the accelerator
  // To render the & character use && on Windows or __ on Linux
  // MacOS doesn't support this concept.
  //
  buildMenu() {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();

      const template =
        process.platform === 'darwin'
          ? this.buildMacOSMenu()
          : this.buildDefaultTemplate();

      const menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menu);
      return menu;

    }

    // Only show a menu on dev for our kiosk app
    return null;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.webContents.openDevTools();
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.inspectElement(x, y);
          }
        }
      ])
        .popup(this.mainWindow);
    });
  }

  buildMacOSMenu() {
    const submenuDefaultView = [
      {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click: () => {
          this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
        }
      },
      {
        label: 'Reload',
        accelerator: 'Command+R',
        click: () => {
          this.mainWindow.webContents.reload();
        }
      },
    ];

    const submenuDevView = submenuDefaultView.concat([
      {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        click: () => {
          this.mainWindow.toggleDevTools();
        }
      }
    ]);

    const submenuView = process.env.NODE_ENV === 'development'
      ? submenuDevView
      : submenuDefaultView;

    // Stele - macOS menus
    return [
      // About
      {
        label: 'Stele',
        submenu: [
          {
            label: 'About Stele',
            selector: 'orderFrontStandardAboutPanel:'
          },
          { type: 'separator' },
          {
            label: 'Hide Stele',
            accelerator: 'Command+H',
            selector: 'hide:'
          },
          {
            label: 'Hide Others',
            accelerator: 'Command+Shift+H',
            selector: 'hideOtherApplications:'
          },
          {
            label: 'Show All',
            selector: 'unhideAllApplications:'
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },

      // Edit
      // Important for common text operations and keyboard shortcuts
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
          { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
          { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
          { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
          {
            label: 'Select All',
            accelerator: 'Command+A',
            selector: 'selectAll:'
          }
        ]
      },

      // View
      {
        label: 'View',
        submenu: submenuView,
      },

      // Window
      // Standard macOS window operations
      {
        label: 'Window',
        submenu: [
          {
            label: 'Minimize',
            accelerator: 'Command+M',
            selector: 'performMiniaturize:'
          },
          {
            label: 'Close',
            accelerator: 'Command+W',
            selector: 'performClose:'
          },
          { type: 'separator' },
          {
            label: 'Bring All to Front',
            selector: 'arrangeInFront:'
          }
        ]
      },

      // Help
      // Standard macOS window operations
      {
        label: 'Help',
        submenu: [
          {
            label: 'Documentation',
            click() {
              shell.openExternal(
                'https://github.com/scimusmn/stele#readme'
              );
            }
          },
          {
            label: 'Report issues',
            click() {
              shell.openExternal('https://github.com/scimusmn/stele/issues');
            }
          }
        ]
      }
    ];
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: '&File',
        submenu: [
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            }
          }
        ]
      },
      {
        label: '&View',
        submenu:
          process.env.NODE_ENV === 'development'
            ? [
              {
                label: '&Reload',
                accelerator: 'Ctrl+R',
                click: () => {
                  this.mainWindow.webContents.reload();
                }
              },
              {
                label: 'Toggle &Full Screen',
                accelerator: 'F11',
                click: () => {
                  this.mainWindow.setFullScreen(
                    !this.mainWindow.isFullScreen()
                  );
                }
              },
              {
                label: 'Toggle &Developer Tools',
                accelerator: 'Alt+Ctrl+I',
                click: () => {
                  this.mainWindow.toggleDevTools();
                }
              }
            ]
            : [
              {
                label: 'Toggle &Full Screen',
                accelerator: 'F11',
                click: () => {
                  this.mainWindow.setFullScreen(
                    !this.mainWindow.isFullScreen()
                  );
                }
              }
            ]
      },
      {
        label: '&Help',
        submenu: [
          {
            label: 'Documentation',
            click() {
              shell.openExternal(
                'https://github.com/scimusmn/stele#readme'
              );
            }
          },
          {
            label: 'Search Issues',
            click() {
              shell.openExternal('https://github.com/scimusmn/stele/issues');
            }
          }
        ]
      }
    ];

    return templateDefault;
  }
}
