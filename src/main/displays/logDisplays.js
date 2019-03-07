import { screen } from 'electron';
import _ from 'lodash';

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
const logDisplays = (store, logger, displaysPrimary) => {
  const displaysAll = screen.getAllDisplays();
  logger.info(`Displays - ${displaysAll.length} displays connected.`);
  _.forEach(displaysAll, (display, index) => {
    logger.info(
      `Displays - Display ${index + 1}${display.id === displaysPrimary.id
        ? ' (Primary) '
        : ' '}- ${display.size.width} x ${display.size.height}`,
    );
  });
};

export default logDisplays;
