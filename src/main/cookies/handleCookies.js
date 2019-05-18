const handleCookies = (mainWindow, store) => {
  mainWindow.webContents.on('did-finish-load', () => {
    const mainSession = mainWindow.webContents.session;

    const name = store.get('kiosk.cookieName');
    const value = store.get('kiosk.cookieValue');
    const url = store.get('kiosk.cookieURL');

    // Name is the only required value,
    // even though it won't be much use
    if (name) {
      const cookie = {
        name,
        value,
        url,
        // Set to expire in the year 2286
        expirationDate: 9999999999,
      };

      mainSession.cookies.set(cookie, (error) => {
        if (error) {
          console.error(error);
        }
      });
    }
  });
};

export default handleCookies;
