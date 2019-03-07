import _ from 'lodash';

const logConsole = (window, logger) => {
  // Log console messages in the render process
  if (process.env.LOG_RENDER_CONSOLE === 'true') {
    window.webContents.on('console-message', (event, level, message, line, sourceId) => {
      const levels = {
        0: 'Info',
        1: 'Warning',
        2: 'Error',
      };
      const getLevel = numberLevel => (_.has(levels, numberLevel.toString())
        ? levels[numberLevel]
        : 'Unknown');
      logger.info(`Render-${getLevel(level)} - ${message} - ${sourceId}:${line}`);
    });
  }
};

export default logConsole;
