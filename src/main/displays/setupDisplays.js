import { screen } from 'electron';
import logDisplays from './logDisplays';

//
// Setup displays
//
// Find attached displays and save their appropriate information in the store
//
const setupDisplays = (store, logger) => {
  //
  // Find primary display ID and save it in the store
  //
  // This is used by the settings page, so that we can identify the primary display to the user.
  //
  const displaysPrimary = screen.getPrimaryDisplay();
  store.set('kiosk.displayPrimaryID', displaysPrimary.id);

  // Write display information to the logs
  logDisplays(store, logger, displaysPrimary);
};

export default setupDisplays;
