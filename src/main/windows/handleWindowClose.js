const handleWindowClose = (window, store) => {
  //
  // Don't close the main window, just hide it.
  //
  // This allows us to reopen the window for the settings screen even if we're not using
  // the primary display for a content window.
  // We need to check for a flag allowing us to bypass this customization, so that we can
  // close all windows when quitting the app.
  window.on('close', (event) => {
    if (!store.get('quitting', false)) {
      if (process.env.NODE_ENV === 'production') {
        window.setKiosk(false);
      }
      window.hide();
      event.preventDefault();
    }
  });
};

export default handleWindowClose;
