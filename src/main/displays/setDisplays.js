import { screen } from 'electron';
import _ from 'lodash';

//
// Get display information
//
const setDisplays = (store, logger) => {
  //
  // Find primary display ID and save it in the store
  //
  // This is used by the settings page, so that we can identify the primary display to the user.
  //
  const displaysPrimary = screen.getPrimaryDisplay();
  store.set('kiosk.displayPrimaryID', displaysPrimary.id);

  //
  // Find all displays and save their details in the store
  //
  // Loop through all displays and save their position, resolution, rotation, and other details
  // to the store. This is used to position content and build the settings page for each display.
  //
  // Log display connection information. This is useful for debugging app startup on kiosks.
  // There are times where the kiosk might be starting up with disconnected displays. This
  // allows us to log those events in time along with system startup logs.
  //
  const displaysAll = screen.getAllDisplays();
  logger.info(`Displays - ${displaysAll.length} displays connected.`);
  _.forEach(displaysAll, (display, index) => {
    logger.info(
      `Displays - Display ${index + 1}${display.id === displaysPrimary.id
        ? ' (Primary) '
        : ' '}- ${display.size.width} x ${display.size.height}`,
    );
  });
  store.set('kiosk.displayCount', displaysAll.length);
};

export default setDisplays;
