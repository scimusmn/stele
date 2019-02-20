import AutoLaunch from 'auto-launch';
import { app } from 'electron';

const autoLaunch = (autoLaunchSetting, logger) => {
  // linux issue: placing path:process.env.APPIMAGE for linux appImage build
  // even though the Stele appImage is place in ~./config when path above is added
  // the appImage does not get called on startup. works fine with .zip build
  const kioskAutoLaunch = new AutoLaunch({
    name: app.getName(),
  });

  function whichSetting(settingsBool, configSetting) {
    if (settingsBool === configSetting) {
      logger.info('App - Auto launch setting already configured');
    } else if (configSetting) {
      logger.info('App - Auto launch enabled');
      kioskAutoLaunch.enable();
    } else {
      logger.info('App - Auto launch disabled');
      kioskAutoLaunch.disable();
    }
  }

  function failureCallback(error) {
    logger.warn(`App - Auto launch error: ${error}`);
  }

  kioskAutoLaunch.isEnabled()
    .then(isEnabled => whichSetting(isEnabled, autoLaunchSetting))
    .catch(failureCallback);
}

export default autoLaunch;
