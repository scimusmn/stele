import { session } from 'electron';

// Ignore macOS system ports; prefer real USB-serial (esp. Arduino).
const IGNORE = /bluetooth|debug-console/i;
const PREFER_NAME = /arduino|silicon\s*labs?|silicon\s*laboratories|usbmodem|usbserial/i;
const ARDUINO_VID = '9025'; // 0x2341

const score = (port) => {
  const name = `${port.displayName || ''} ${port.portName || ''}`;
  if (IGNORE.test(name)) return -1;
  return (port.vendorId ? 10 : 0)
    + (port.vendorId === ARDUINO_VID ? 50 : 0)
    + (PREFER_NAME.test(name) ? 20 : 0)
    + (port.serialNumber ? 5 : 0);
};

const label = port => (
  [port.portName, port.displayName, port.vendorId, port.productId].filter(Boolean).join(' | ')
);

// Auto-grant Web Serial for exhibit apps (kiosk has no device chooser UI).
const grantWebSerial = (logger) => {
  const ses = session.defaultSession;
  logger.info('WebSerial: Enabling auto-grant for serial devices');

  ses.setDevicePermissionHandler((details) => {
    if (details.deviceType !== 'serial') return false;
    logger.info(`WebSerial: Granting device permission for origin ${details.origin}`);
    return true;
  });

  ses.on('select-serial-port', (event, portList, _webContents, callback) => {
    event.preventDefault();
    logger.info(`WebSerial: Ports available: ${portList.map(label).join('; ') || '(none)'}`);

    const selected = portList.reduce(
      (best, port) => (score(port) >= 0 && (!best || score(port) > score(best)) ? port : best),
      null,
    );

    if (!selected) {
      logger.info('WebSerial: No usable serial ports available to select');
      callback('');
      return;
    }

    logger.info(`WebSerial: Auto-selecting port ${label(selected)}`);
    callback(selected.portId);
  });
};

export default grantWebSerial;
