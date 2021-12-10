//
// Establish a secure channel for IPC communication
//
// Whitelist messages that can be shared via IPC between the main and renderer processes.
// This exposes a subset of authorized IPC channels to the renderer process as window.api
//
// This method is more secure, because it doesn't expose wide-open access to the main
// process which has access to the host machine.
// https://www.electronjs.org/docs/latest/tutorial/security
//
const {
  contextBridge,
  ipcRenderer,
} = require('electron');

contextBridge.exposeInMainWorld(
  'api', {
    // API messages sent from the React Renderer process
    send: (channel, data) => {
      const validChannels = ['routerMounted'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // API messages from the Main Electron process to Renderer
    receive: (channel, func) => {
      const validChannels = ['navigate'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
  },
);
