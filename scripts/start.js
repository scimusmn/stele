//
// Dev launcher script
//
// Run webpack dev config, and then launch Electron
//
const childProcess = require('child_process');
const electron = require('electron');
const webpack = require('webpack');
const config = require('../config/webpack.config.base');

const env = 'development';
const compiler = webpack(config(env));
let electronStarted = false;

const watching = compiler.watch({}, (err, stats) => {
  if (!err && !stats.hasErrors() && !electronStarted) {
    electronStarted = true;

    childProcess
      .spawn(electron, ['.'], { stdio: 'inherit' })
      .on('close', () => {
        watching.close();
      });
  }
});
