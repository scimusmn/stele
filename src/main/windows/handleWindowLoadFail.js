import { app } from 'electron';
import _ from 'lodash';
import { mainWindowNavigateSettings } from './navigate';

//
// Respond to failed window loads
//
// If the error is about an invalid URL, return the user to the settings page.
// Otherwise, log an error and quit Stele.
//
const handleWindowLoadFail = (window, appHome, store, logger) => {
  window.webContents.on(
    'did-fail-load', (event, errorCode, errorDescription) => {
      if (
        errorDescription === 'ERR_INVALID_URL'
        || errorDescription === 'ERR_NAME_NOT_RESOLVED'
      ) {
        const configuredURL = _.get(store.get('kiosk'), 'displayHome');
        logger.info(
          `App - Stele is configured to load an invalid URL(${configuredURL}) - ${errorDescription}:${errorCode}`,
        );
        mainWindowNavigateSettings(window, appHome, store);
      } else {
        logger.error(`App - Unknown web contents load failure - ${errorDescription}:${errorCode}`);
        app.quit();
      }
    },
  );
};

export default handleWindowLoadFail;
