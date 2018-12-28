import { Menu } from 'electron';

const setupDevelopmentEnvironment = (window) => {
  window.webContents.openDevTools();
  window.webContents.on('context-menu', (e, props) => {
    const { x, y } = props;

    Menu.buildFromTemplate([
      {
        label: 'Inspect element',
        click: () => {
          window.inspectElement(x, y);
        },
      },
    ])
      .popup(window);
  });
};

export default setupDevelopmentEnvironment;
