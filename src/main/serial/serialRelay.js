/* eslint no-use-before-define: 0 */

import { ipcMain } from 'electron';
import serialport from 'serialport';

let portList;

// Type of parser we use
// (Looks for new lines '\n')
const { Readline } = serialport.parsers;
const parser = new Readline();

// Renderers that have requested
// communication from serial ports
const subscribers = {};
const activePorts = {};

// Automatically enable Arduinos when found.
const autoEnableArduinos = true;

// Usually 9600 or 115200
const defaultBaudRate = 115200;

// Key sent from renderer process
// signalling the desire for communication.
const IPC_HANDSHAKE = 'ipc-handshake';

// Keys used when passing through data
// to and from renderer process
const SERIAL_TO_RENDERER = 'serial-to-renderer';
const RENDERER_TO_SERIAL = 'renderer-to-serial';

const serialRelay = () => {
  // Gather all detected serial ports
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

    // Pass through to all active ports
    outToSerial(arg);
  });

/*  // Temp test
  setInterval(() => {
    const msg = Math.round(Math.random() * 999);

    broadcast(SERIAL_TO_RENDERER, `·‡° ${msg}`);
  }, 5000); */
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

const outToSerial = (message) => {
  const keys = Object.keys(activePorts);
  if (keys.length === 0) {
    console.log(`Serial message [${message}] could not be written. No active ports...`);
  } else {
    keys.forEach((key) => {
      // Write message to serialport
      activePorts[key].write(message);
    });
  }
};

const refreshPortList = () => {
  serialport.list().then((list) => {
    Object.keys(list).forEach((key) => {
      const portObj = list[key];
      const { comName, manufacturer, serialNumber } = portObj;

      // Scrape for Arduinos...
      if (autoEnableArduinos === true
          && manufacturer !== undefined) {
        if (manufacturer.indexOf('Arduino') !== -1
            || manufacturer.indexOf('Silicon Labs') !== -1) {
          console.log('Auto-enabling Microcontroller:', comName);
          enableSerialPort(comName, { baudRate: defaultBaudRate });
        }
      }
    });

    console.log('Refreshed Port List:');
    console.log(list);
    portList = list;

    // Wake Arduinos
    outToSerial('{wakeArduino}');

    return portList;
  })
    .catch(error => console.log(error));
};


const enableSerialPort = (path, options) => {
  console.log('enableSerialPort', path);
  const port = new serialport(path, options);
  port.pipe(parser);

  // Open errors will be emitted as an error event
  port.on('error', onOpenPortError);

  // All data events according to parser
  parser.on('data', onNewSerialData);

  // TODO: Instead of path, we may
  // want to create our own unique
  // ID based on serialnumber info....
  activePorts[path] = port;
};

const onOpenPortError = (err) => {
  console.log('Error: ', err.message);
};

const onNewSerialData = (data) => {
  console.log('onNewSerialData:', data);
  broadcast(SERIAL_TO_RENDERER, data);
};


// TODO: The below information could come from
// Settings screen.
// TEMP
/*
enableSerialPort('/dev/tty.usbmodem1421', { baudRate: 9600 });
enableSerialPort('/dev/tty.usbmodem1411', { baudRate: 115200 });
*/

export default serialRelay;
