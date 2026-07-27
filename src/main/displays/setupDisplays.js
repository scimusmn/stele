import { screen } from 'electron';
import _ from 'lodash';
import logDisplays from './logDisplays';

// Find the connected display that a saved display setting belongs to
//
// The OS hands out different display IDs after a reboot or after displays are reconnected in a
// different order, so the ID is the least trustworthy thing we know about a display. We look for
// the screen in the same place first, then for the same monitor, and only fall back to the ID.
// Candidates are only the displays that no other saved display has claimed, so two saved
// displays can never point at the same screen.

const findConnectedDisplay = (savedDisplay, candidates) => (
  // Same position and resolution. This keeps content on the screen it was configured for.
  _.find(candidates, ({ bounds }) => _.isEqual(bounds, savedDisplay.bounds))

  // Same monitor and resolution, for when the displays have been rearranged.
  || _.find(candidates, ({ label, size }) => savedDisplay.label
    && label === savedDisplay.label
    && _.isEqual(size, savedDisplay.size))

  // Same ID, even though the screen looks different. Better than forgetting the settings.
  || _.find(candidates, { id: savedDisplay.id })
);

// Setup displays
// Find attached displays and save their appropriate information in the store
const setupDisplays = (store, logger) => {
  // Find primary display ID and save it in the store
  const displaysPrimary = screen.getPrimaryDisplay();
  store.set('kiosk.displayPrimaryID', displaysPrimary.id);

  logDisplays(store, logger, displaysPrimary);

  // Get the displays registered in the app settings
  const settingDisplaysInitial = _.get(store.get('kiosk'), 'displays');

  // Handle empty display object in settings
  // If we're starting the app for the first time the displays setting will be blank in the data
  // store. Create the display settings with our screen information and add a blank URL item.
  if (settingDisplaysInitial == null) {
    store.set(
      'kiosk.displays',
      _.map(screen.getAllDisplays(), item => _.extend({}, item, { connected: true, enabled: true, url: '' })),
    );
  } else {
    // Connected displays that no saved display has been matched to yet
    let displaysUnclaimed = screen.getAllDisplays();

    const mergedDisplays = _.map(settingDisplaysInitial, (savedDisplay) => {
      const match = findConnectedDisplay(savedDisplay, displaysUnclaimed);
      if (!match) {
        return _.extend({}, savedDisplay, { connected: false });
      }

      displaysUnclaimed = _.without(displaysUnclaimed, match);
      if (match.id !== savedDisplay.id) {
        logger.info(
          `Displays - Saved display re-identified (old ID: ${savedDisplay.id}, new ID: ${match.id})`,
        );
      }

      return _.extend({}, savedDisplay, {
        id: match.id,
        bounds: match.bounds,
        size: match.size,
        rotation: match.rotation,
        connected: true,
      });
    });

    // Register any connected display that isn't in the settings yet
    _.forEach(displaysUnclaimed, (connectedDisplay) => {
      mergedDisplays.push(_.extend({}, connectedDisplay, { connected: true, enabled: true, url: '' }));
    });

    // Drop disconnected displays that hold no configuration. These are usually leftovers from
    // an earlier run where the display was registered under a different ID. They carry nothing
    // the user set up, and they get registered again if the display comes back.
    store.set('kiosk.displays', _.filter(mergedDisplays, ({ connected, url }) => connected || url));
  }
};

export default setupDisplays;
