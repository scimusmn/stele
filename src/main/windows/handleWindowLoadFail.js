import { app } from 'electron';
import _ from 'lodash';
import { mainWindowNavigateSettings } from './navigate';

//
// Respond to failed window loads
//
// If the error is about an invalid URL, return the user to the settings page.
// Otherwise, log an error and quit Stele.
//
const handleWindowLoadFail = (window, store, logger) => {
  window.webContents.on(
    'did-fail-load', (event, errorCode, errorDescription) => {
      if (
        errorDescription === 'ERR_INVALID_URL'
        || errorDescription === 'ERR_NAME_NOT_RESOLVED'
        || errorDescription === 'ERR_ADDRESS_UNREACHABLE'
      ) {
        const configuredURL = _.get(store.get('kiosk'), 'displayHome');
        logger.info(
          `App - Stele is configured to load an invalid URL(${configuredURL}) - ${errorDescription}:${errorCode}`,
        );
        mainWindowNavigateSettings(window, store);
      } else if (errorCode === -3) {
        // This errorCode is a false positive.
        // A 'did-finish-load' event will fire immediately after.
        // This seems to happen while using a hot-reload development server.
        // https://github.com/electron/electron/issues/4396
        logger.info('App - Ignoring "did-fail-load" error code: -3.');
      } else {
        logger.error(`App - Unknown web contents load failure - ${errorDescription}:${errorCode}`);
        app.quit();
      }
    },
  );
};

export default handleWindowLoadFail;
