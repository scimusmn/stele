const handleWindowShow = (window, logger) => {
  window.once('ready-to-show', () => {
    logger.info('Window - Showing main window');
    window.show();
  });

  // Ensure the application window has focus as well as the embedded content
  // will be called on settings page and when url is switched to home url
  window.webContents.on('dom-ready', () => {
    if (process.env.NODE_ENV === 'production') {
      logger.info('Window - Focusing main window');
      window.focus();
      window.webContents.focus();
    }
  });
};

export default handleWindowShow;
