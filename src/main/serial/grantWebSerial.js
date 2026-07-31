import { session } from 'electron';

// ignore macOS system ports in favor of real serial devices
const IGNORE = /bluetooth|debug-console/i;
const PREFER_NAME = /arduino|silicon\s*labs?|silicon\s*laboratories|usbmodem|usbserial/i;
const ARDUINO_VID = '9025'; // 0x2341

// score a port based on its name, vendor ID, product ID, and serial number
const score = (port) => {
  const name = `${port.displayName || ''} ${port.portName || ''}`;
  if (IGNORE.test(name)) return -1;
  return (port.vendorId ? 10 : 0)
    + (port.vendorId === ARDUINO_VID ? 50 : 0)
    + (PREFER_NAME.test(name) ? 20 : 0)
    + (port.serialNumber ? 5 : 0);
};

// label a port based on its name, vendor ID, product ID, and serial number
const label = port => (
  [port.portName, port.displayName, port.vendorId, port.productId].filter(Boolean).join(' | ')
);

// pick the best port based on its score
const pickPort = (ports = []) => ports.reduce(
  (best, port) => (!best || score(port) > score(best) ? port : best),
  null,
);

// Auto-grant Web Serial for exhibit apps (kiosk has no device chooser UI).
const grantWebSerial = (logger) => {
  const ses = session.defaultSession;
  logger.info('WebSerial: Enabling auto-grant for serial devices');

  ses.setPermissionCheckHandler(() => true);

  ses.setDevicePermissionHandler((details) => {
    if (details.deviceType !== 'serial') return false;
    logger.info(`WebSerial: Granting device permission for origin ${details.origin}`);
    return true;
  });

  ses.on('select-serial-port', (event, portList, _webContents, callback) => {
    event.preventDefault();
    logger.info(`WebSerial: Ports available: ${portList.map(label).join('; ') || '(none)'}`);

    const selected = pickPort(portList);
    if (!selected || score(selected) < 0) {
      logger.info('WebSerial: No usable serial ports available to select');
      callback('');
      return;
    }

    logger.info(`WebSerial: Auto-selecting port ${label(selected)}`);
    callback(selected.portId);
  });
};

export default grantWebSerial;
