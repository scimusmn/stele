/* eslint no-use-before-define: 0 */
/* eslint new-cap: 0 */

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
      const { comName, manufacturer } = portObj;

      // Scrape for Arduinos...
      if (autoEnableArduinos === true
          && manufacturer !== undefined) {
        if (manufacturer.indexOf('Arduino') !== -1
            || manufacturer.indexOf('Silicon Labs') !== -1) {
          console.log('Auto-enabling:', comName, '-', manufacturer);
          enableSerialPort(comName, { baudRate: defaultBaudRate });
        }
      }
    });

    portList = list;
    // console.log('Refreshed Port List:');
    // console.log(portList);

    // Wake Arduinos
    // TODO: The Arduino does not seem to be ready for the wake
    // message at this point. We need to check on an interval, 
    // then mark this "port" as "woke", and cease attempting
    // to wake.
    // TODO: Think through what happens if serial connection is reset.
    // When reset, the arduino needs another handshake.  
    // --> Upon receipt of a matching {“message”:”arduino-ready”, “value”:1}
    // message, we could set a flag on that object in the portList
    // e.g., 
    // const onNewSerialData = (data) => {
    //   if (data.message.indexOf("arduino-ready") !== -1) {
    //    ... we don't know which port this is. 
    //    ... Doh.
    //   }
    //   broadcast(SERIAL_TO_RENDERER, data);
    // };
    // On second thought, maybe we should handle the wake handshake
    // through the client. That would keep this serialRelay class 
    // completely agnostic to message formatting. Yes. Let's do that.
    // Picard out.
    outToSerial('{“message”:”wake-arduino”, “value”:1}');

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


export default serialRelay;
