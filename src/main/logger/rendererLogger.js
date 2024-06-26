import { ipcMain } from 'electron';
import { createLogger, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import os from 'os';

const RENDERER_LOG_CHANNEL = 'renderer-log-channel';
const logDirectory = path.join(os.homedir(), 'kiosk-logs');

// Ensure log directory exists
if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory, { recursive: true });

const rendererLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(logDirectory, 'log-%DATE%.log'),
      datePattern: 'YYYY-MM-DD-HH',
      maxSize: '60m',
      maxFiles: '365d',
    }),
  ],
});

// Listening for log events from the renderer process
ipcMain.on(RENDERER_LOG_CHANNEL, (event, data) => {
  const dataString = JSON.stringify(data);
  console.log(`RENDERER_LOG_CHANNEL: ${dataString}`);
  rendererLogger.info(dataString);
});

export default rendererLogger;
