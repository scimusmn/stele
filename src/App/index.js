import React from 'react';
import { ipcRenderer } from 'electron';

function App() {
  return (
    <div>
      WIP
      <button
        onClick={() => {
          ipcRenderer.send(
            'ipc-test-channel',
            'ipc value from client'
          );
        }}
      >Click for IPC test</button>
    </div>
  );
}

export default App;
