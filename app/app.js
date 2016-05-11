/**
 * Electron helper packages
 */
import os from 'os';
import { remote } from 'electron';
import jetpack from 'fs-jetpack';
import env from './env';

/**
 * Your application logic
 */
import { greet } from './lib/hello_world';

console.log('Loaded environment variables:', env);

var app = remote.app;
var appDir = jetpack.cwd(app.getAppPath());

console.log('The author of this app is:', appDir.read('package.json', 'json').author);

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('greet').innerHTML = greet();
  document.getElementById('platform-info').innerHTML = os.platform();
  document.getElementById('env-name').innerHTML = env.name;
});
