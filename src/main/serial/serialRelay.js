/* eslint no-use-before-define: 0 */
/* eslint new-cap: 0 */

import { ipcMain } from 'electron';
import serialport from 'serialport';

let portList;
let logger;
let refreshInterval;

// Type of parser we use
// (Looks for new lines '\n')
const { Readline } = serialport.parsers;
let parser = new Readline();

// Renderers that have requested
// communication from serial ports
const subscribers = {};
let activePorts = {};

// Automatically enable Arduinos when found.
const autoEnableArduinos = true;

// Usually 9600 or 115200
const defaultBaudRate = 115200;

// Key sent from renderer process
// signalling the desire for communication.
const IPC_HANDSHAKE = 'ipc-handshake';

// Key to flush all current serial buffers.
const FLUSH_COMMAND = 'command_flush_all_serial';

// Key to flush close and re-open all serial ports.
const RESET_PORTS_COMMAND = 'command_reset_all_ports';

// Keys used when passing through data
// to and from renderer process
const SERIAL_TO_RENDERER = 'serial-to-renderer';
const RENDERER_TO_SERIAL = 'renderer-to-serial';

const serialRelay = (_logger) => {
  logger = _logger;

  logger.info('serialRelay: Initialization');

  // Gather all detected serial ports
  refreshPortList();

  ipcMain.on(IPC_HANDSHAKE, (event, arg) => {
    console.log('IPC_HANDSHAKE received. Adding to subscribers:', arg.toString());
    logger.info('serialRelay: IPC_HANDSHAKE received. Adding renderer subscriber.');

    const subscriber = event.sender;

    // NOTE: We overwrite any subscriber that
    // requests communication using the sender.id.
    // This prevents subscriber duplicates when a window
    // reloads the page and requests communication again...
    // TODO: It seems like you can rely on the primary display
    // always subscribing with the same id to overwrite, but
    // with multiple screens this isn't reliable with multiple
    // windows toggling to and from the settings screen.
    subscribers[subscriber.id] = subscriber;

    logger.info(`serialRelay: subscribers: ${Object.keys(subscribers).toString()}`);

    console.log('Requesting subscriber id:', subscriber.id);
    console.log('Total subscribers:', Object.keys(subscribers).length);

    // It isn't necessary for renderer to receive
    // this response, but is useful for debugging
    subscriber.send(IPC_HANDSHAKE, 'handshake-confirmed');
  });

  // Listen for renderer generated messages
  // and pass along to Arduino without manipulating
  ipcMain.on(RENDERER_TO_SERIAL, (event, arg) => {
    console.log('RENDERER_TO_SERIAL received. ', arg);
    logger.info(`serialRelay: RENDERER_TO_SERIAL received. ${arg.toString()}`);

    // Catch special commands
    if (arg === FLUSH_COMMAND) {
      flushBuffers();
    } else if (arg === RESET_PORTS_COMMAND) {
      resetPorts();
    } else {
      // Pass through to all active ports
      outToSerial(arg);
    }
  });
};

const flushBuffers = () => {
  const keys = Object.keys(activePorts);
  logger.info(`serialRelay: flushBuffers: ${keys.toString()}`);
  if (keys.length === 0) {
    logger.info('No flushing necessary. No active ports...');
  } else {
    keys.forEach((key) => {
      const port = activePorts[key];
      // Flush and serial scraps from serial buffer
      port.flush((err) => {
        if (err) logger.info(`serialRelay: flush error: ${err.toString()}`);
        logger.info('serialRelay: port was flushed');
      });
    });
  }
};

const resetPorts = () => {
  // Reset the parser so we don't get a bunch of duplicate messages
  parser = new Readline();

  const keys = Object.keys(activePorts);
  logger.info(`serialRelay: resetPorts: ${keys.toString()}`);
  if (keys.length === 0) {
    logger.info('No port resets necessary. No active ports...');
  } else {
    keys.forEach((key) => {
      const port = activePorts[key];
      logger.info(`serialRelay: Resetting port:${key}, ${port.isOpen}, ${port.comName}`);
      if (port.isOpen) {
        port.close();
      } else {
        logger.info('serialRelay: resetPorts: Port is already closed.');
      }
      delete activePorts[key];
    });

    // Empty activePorts
    activePorts = {};

    // Give ports 3 seconds to gracefully
    // close before re-opening.
    refreshInterval = setInterval(refreshPortList, 3000);
  }
};

const broadcast = (message, value) => {
  if (Object.keys(subscribers).length === 0) {
    console.log(`Message [${message}] could not be broadcast. No subscribers...`);
    logger.info(`serialRelay: Message [${message}] could not be broadcast. No subscribers...`);

    console.log('Does a reference to an ipcRenderer exist? https://github.com/scimusmn/arduino-base#setting-up-an-app');
    logger.info('Does a reference to an ipcRenderer exist? https://github.com/scimusmn/arduino-base#setting-up-an-app');
  } else {
    Object.keys(subscribers).forEach((key) => {
      // Will error out if a subscribers is no longer available
      try {
        subscribers[key].send(message, value);
      } catch (err) {
        logger.info(`serialRelay: broadcast error: [${key}] ${JSON.stringify(err)}`);
      }
    });
  }
};

const outToSerial = (message) => {
  const keys = Object.keys(activePorts);
  if (keys.length === 0) {
    console.log(`Serial message [${message}] could not be written. No active ports...`);
    logger.info(`serialRelay: Serial message [${message}] could not be written. No active ports...`);
  } else {
    keys.forEach((key) => {
      // Write message to serialport
      logger.info(`serialRelay: outputting to port: [${key}]`);
      activePorts[key].write(message);
    });
  }
};

const refreshPortList = () => {
  logger.info('serialRelay: refreshPortList');

  const allowedManufacturers = [
    'Arduino',
    'Silicon Labs',
    'Silicon Laboratories',
  ];

  serialport.list().then((list) => {
    Object.keys(list).forEach((key) => {
      const portObj = list[key];
      const { comName, manufacturer } = portObj;

      // Scrape for Arduinos...
      if (autoEnableArduinos === true
          && manufacturer !== undefined) {
        if (allowedManufacturers
          .some(allowedManufacturer => manufacturer
            .includes(allowedManufacturer))) {
          console.log(`Auto-enabling: ${comName} - ${manufacturer}`);
          logger.info(`serialRelay: Auto-enabling: ${comName} - ${manufacturer}`);
          enableSerialPort(comName, { baudRate: defaultBaudRate });
        }
      }
    });

    portList = list;

    return portList;
  }).catch((error) => {
    console.log(error);
    logger.info(`serialRelay: Error refreshing port list: ${error.toString()}`);
  });
};

const enableSerialPort = (path, options) => {
  console.log('enableSerialPort', path);
  logger.info(`serialRelay: enableSerialPort: ${path.toString()}`);
  const port = new serialport(path, options);
  port.pipe(parser);

  // Open errors will be emitted as an error event
  port.on('error', onOpenPortError);

  // We want to know if a port closes,
  // in case it is unintentional.
  port.on('close', onPortClose);

  // All data events according to parser
  parser.on('data', onNewSerialData);

  // TODO: Instead of path, we may
  // want to create our own unique
  // ID based on serial number info....
  activePorts[path] = port;

  clearInterval(refreshInterval);
};

const onOpenPortError = (err) => {
  console.log('Error: ', err.message);
  logger.info(`serialRelay: OpenPortError: ${err.message}`);
};

const onPortClose = (err) => {
  if (err) logger.info(`serialRelay: onPortClose error: ${err.message}`);
  logger.info('serialRelay: onPortClose');
};

const onNewSerialData = (data) => {
  console.log('onNewSerialData:', data);
  logger.info(`serialRelay: onNewSerialData: ${data.toString()}`);
  broadcast(SERIAL_TO_RENDERER, data);
};


export default serialRelay;
