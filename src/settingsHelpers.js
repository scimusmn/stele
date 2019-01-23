import AutoLaunch from 'auto-launch';
import { app } from 'electron';

export function autoLaunchApp(autoLaunchSetting) {
  // added process.env.APPIMAGE for linux appimage build
  // process.env.APPIMAGE will return undefined in Qindows and Mac
  // when path: is undefined AutoLaunch default guesses correct location of application only
  // for Mac and Windows
  const kioskAutoLaunch = new AutoLaunch({
    name: app.getName(),
    path: process.env.APPIMAGE,
  });
  console.log(process.env.APPIMAGE);
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
