import depcheck from 'depcheck';
import _ from 'lodash';
import chalk from 'chalk';
import path from 'path';

const options = {
  // ignore dependencies that matches these globs
  ignoreMatches: [
    'babel-core',
    'babel-loader',
    'bootstrap',
    'concurrently',
    'cross-env',
    'css-loader',
    'devtron',
    'electron-builder',
    'electron-log',
    'electron-rebuild',
    'electron-run',
    'eslint-formatter-pretty',
    'eslint-import-resolver-webpack',
    'file-loader',
    'file-loader',
    'husky',
    'jquery',
    'popper.js',
    'prettier',
    'run-electron',
    'sass-loader',
    'spectron',
    'style-loader',
    'stylelint',
    'stylelint-config-prettier',
    'stylelint-config-standard',
    'url-loader',
    'webpack-cli',
    'webpack-dev-server',
    'yarn',
  ],
  // skip calculation of missing dependencies
  skipMissing: true,
  ignoreDirs: [
    'dist',
    'dll',
    'release',
    'src/dist',
  ],
  // the target special parsers
  specials: [
    depcheck.special.babel,
    depcheck.special.eslint,
    depcheck.special.webpack,
  ],
};

depcheck(path.join(__dirname, '..'), options, (unused) => {
  const unusedDependencies = _.get(unused, 'dependencies', null);
  const unusedDevDependencies = _.get(unused, 'devDependencies', null);
  if (!_.isEmpty(unusedDependencies)) {
    console.log(chalk.yellow.bold('Unused dependencies'));
    console.log(chalk.yellow(_.join(unusedDependencies, '\n')));
  }
  if (!_.isEmpty(unusedDevDependencies)) {
    console.log(chalk.yellow.bold('Unused devDependencies'));
    console.log(chalk.yellow(_.join(unusedDevDependencies, '\n')));
  }
});
