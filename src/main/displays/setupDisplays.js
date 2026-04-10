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

    // Build collection of displays that are connected
    const displaysAllConnected = screen.getAllDisplays();

    const mergedDisplays = _.map(settingDisplaysInitial, (savedDisplay) => {
      const match = _.find(displaysAllConnected, { id: savedDisplay.id });
      if (match) {
        return _.extend({}, savedDisplay, {
          bounds: match.bounds,
          size: match.size,
          rotation: match.rotation,
          connected: true,
        });
      }
      return _.extend({}, savedDisplay, { connected: false });
    });

    _.forEach(displaysAllConnected, (connectedDisplay) => {
      if (!_.find(mergedDisplays, { id: connectedDisplay.id })) {
        mergedDisplays.push(_.extend({}, connectedDisplay, { connected: true, enabled: true, url: '' }));
      }
    });

    store.set('kiosk.displays', mergedDisplays);
  }
};

export default setupDisplays;
