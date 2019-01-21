import AutoLaunch from 'auto-launch';


export function autoLaunchApp(autoLaunchSetting) {
  console.log("autolaunch settings: " + autoLaunchSetting);
  function successCallback(result) {
    console.log("auto launch Success: " + result);
  }
  
  function failureCallback(error) {
    console.log("auto launch Error: " + error);
  }
  const kioskAutoLaunch = new AutoLaunch({
    name: 'electron'
  });
  if(autoLaunchSetting){
    console.log("enable startup");
    kioskAutoLaunch.enable().then(successCallback, failureCallback);
  }else{
    console.log("disable auto startupp")
    kioskAutoLaunch.disable().then(successCallback, failureCallback);
  }
  
}
