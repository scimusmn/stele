import { app } from 'electron';
import { createLogger, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import os from 'os';

//
// Setup file logging with Winston
//
// Logs are saved in the appropriate log folder for the current OS and rotated daily.
//
// Electron's getPath helper isn't working for Ubuntu Linux right now:
// https://github.com/electron/electron/issues/15877
// So we manually configure the ~/.config/Stele/ folder the standard app logging folder.
//
// We aren't supporting Linux going forward, but we're keeping this here in case
// we have an exhibit project where we need to support this again.
// It doesn't affect the other OS builds.
//
// Ensure the logs path is registered before getPath('logs'). On some Electron /
// Windows combinations this throws if setAppLogsPath was never called, which
// would crash the main process at import time (before any window appears).
try {
  app.setAppLogsPath();
} catch (error) {
  // Path may already be set; fall through to getPath / userData below.
}

const baseLogPath = process.platform === 'linux'
  ? path.join(os.homedir(), '.config', app.getName())
  : (() => {
    try {
      return app.getPath('logs');
    } catch (error) {
      return path.join(app.getPath('userData'), 'logs');
    }
  })();

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(
      info => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(baseLogPath, 'log-%DATE%.log'),
      datePattern: 'YYYY-MM-DD-HH',
      maxSize: '20m',
      maxFiles: '90d',
    }),
  ],
});

export default logger;
