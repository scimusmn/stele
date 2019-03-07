import { screen } from 'electron';
import _ from 'lodash';
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


  // Get the displays registered in the app settings
  const settingDisplaysInitial = _.get(store.get('kiosk'), 'displays');

  //
  // Handle empty display object in settings
  //
  // If we're starting the app for the first time the displays setting will be blank in the data
  // store. Create the display settings with our screen information and add a blank URL item.
  if (settingDisplaysInitial == null) {
    store.set(
      'kiosk.displays',
      _.map(screen.getAllDisplays(), item => _.extend({}, item, { connected: true, enabled: true, url: '' })),
    );
  } else {
    //
    // Handle existing settings
    //
    // If some displays are already configured in the app, we need to evaluate whether the
    // configured displays match the hardware connected to the computer.
    // Start by setting all displays to disconnected
    // const settingDisplaysIntermediate = _.get(store.get('kiosk'), 'displays');

    // Build collection of displays that are connected
    const displaysAllConnected = _.map(
      screen.getAllDisplays(),
      item => _.extend({}, item, { connected: true }),
    );
    // Set all settings displays to disconnected, before merging
    const settingsDisplays = _.map(
      settingDisplaysInitial,
      item => _.extend({}, item, { connected: false }),
    );
    const mergedDisplays = _.merge(settingsDisplays, displaysAllConnected);
    store.set('kiosk.displays', mergedDisplays);
  }
};

export default setupDisplays;
