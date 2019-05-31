import AutoLaunch from 'auto-launch';
import { app } from 'electron';

const handleAutoLaunch = (autoLaunchSetting, logger) => {
  //
  // Linux issue:
  //
  // Placing path:process.env.APPIMAGE for linux appImage build
  // even though the Stele appImage is place in ~./config when path above is added
  // the appImage does not get called on startup. works fine with .zip build
  //
  // We aren't supporting Linux going forward, but we're keeping this note here in case
  // we have an exhibit project where we need to support this again.
  //
  const kioskAutoLaunch = new AutoLaunch({
    name: app.getName(),
  });

  const whichSetting = (settingsBool, configSetting) => {
    if (settingsBool === configSetting) {
      logger.info('App - Auto launch setting already configured');
    } else if (configSetting) {
      logger.info('App - Auto launch enabled');
      kioskAutoLaunch.enable();
    } else {
      logger.info('App - Auto launch disabled');
      kioskAutoLaunch.disable();
    }
  };

  const failureCallback = (error) => {
    logger.warn(`App - Auto launch error: ${error}`);
  };

  kioskAutoLaunch.isEnabled()
    .then(isEnabled => whichSetting(isEnabled, autoLaunchSetting))
    .catch(failureCallback);
};

export default handleAutoLaunch;
