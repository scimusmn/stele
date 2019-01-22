import AutoLaunch from 'auto-launch';
import { app } from 'electron';

export function autoLaunchApp(autoLaunchSetting) {
  const kioskAutoLaunch = new AutoLaunch({
    name: app.getName(),
  });
  console.log(app.getName());
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
