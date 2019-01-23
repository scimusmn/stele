import AutoLaunch from 'auto-launch';
import { app } from 'electron';

export function autoLaunchApp(autoLaunchSetting) {
  // adding path:process.env.APPIMAGE for linux appimage build
  // places appImage in ~./config/autostart
  // eventhough the appImage for Stele is placed within ~./config/autostart
  // the app does not open on startup
  // the .zip release works without issue

  const kioskAutoLaunch = new AutoLaunch({
    name: app.getName(),
  });
  function whichSetting(settingsBool, configSetting) {
    if (settingsBool == configSetting) {
      console.log('autolaunch setting already configured');
    } else if (configSetting) {
      console.log('autolaunch enabled');
      kioskAutoLaunch.enable();
    } else {
      console.log('autolaunch disabled');
      kioskAutoLaunch.disable();
    }
  }
  function successCallback(result) {
    console.log(`auto launch Success: ${result}`);
  }
  function failureCallback(error) {
    console.log(`auto launch Error: ${error}`);
  }
  kioskAutoLaunch.isEnabled()
    .then(isEnabled => whichSetting(isEnabled, autoLaunchSetting))
    .catch(failureCallback);
}
