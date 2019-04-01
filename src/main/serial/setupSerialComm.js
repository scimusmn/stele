import { ipcMain } from 'electron';
import serialport from 'serialport';

let portList;

// Renderers that have requested
// communication from serial ports
const subscribers = {};

// Key sent from renderer process
// signalling the desire for communication.
const IPC_HANDSHAKE = 'ipc-handshake';

// Keys used when passing through data
// to and from renderer process
const SERIAL_TO_RENDERER = 'serial-to-renderer';
const RENDERER_TO_SERIAL = 'renderer-to-serial';

const setupSerialComm = () => {
  console.log('setupSerialComm :) ........... ');

  refreshPortList();

  ipcMain.on(IPC_HANDSHAKE, (event, arg) => {
    console.log('IPC_HANDSHAKE recieved. Adding to subscribers:', arg);

    const subscriber = event.sender;

    // NOTE: We overwrite any subscriber that
    // requests communication using the sender.id.
    // This prevents subscriver duplicates when a window
    // reloads the page and requests communication again...
    subscribers[subscriber.id] = subscriber;

    console.log('Requesting subscriber id:', subscriber.id);
    console.log('Total subscribers:', Object.keys(subscribers).length);

    // It isn't necessary for renderer to recieve
    // this response, but is useful for debugging
    subscriber.send(IPC_HANDSHAKE, 'handshake-confirmed');
  });

  // Listen for renderer generated messages
  // and pass along to Arduino without manipulating
  ipcMain.on(RENDERER_TO_SERIAL, (event, arg) => {
    console.log('RENDERER_TO_SERIAL recieved. ', arg);

    // TODO: Pass through to (all?) arduino(s)...
  });

  // Temp test
  setInterval(() => {
    const msg = Math.round(Math.random() * 999);

    broadcast(SERIAL_TO_RENDERER, `·‡° ${msg}`);
  }, 5000);
};

const broadcast = (message, value) => {
  if (Object.keys(subscribers).length === 0) {
    console.log(`Message [${message}] could not be broadcast. No subscribers...`);
  } else {
    Object.keys(subscribers).forEach((key) => {
      subscribers[key].send(message, value);
    });
  }
};

const refreshPortList = () => {
  serialport.list().then((list) => {
    console.log(list);
    portList = list;
  });
};

export default setupSerialComm;
