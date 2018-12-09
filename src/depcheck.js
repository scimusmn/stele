import depcheck from 'depcheck';
import path from 'path';

const options = {
  ignoreMatches: [ // ignore dependencies that matches these globs
    'bootstrap',
    'electron-log',
    'devtron',
    'spectron',
    'grunt-*',
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
    depcheck.special.eslint,
    depcheck.special.webpack
  ],
};

depcheck(path.join(__dirname, '..'), options, (unused) => {
  console.log('Unused dependencies');
  console.log(unused.dependencies); // an array containing the unused dependencies
  console.log('Unused devDependencies');
  console.log(unused.devDependencies); // an array containing the unused devDependencies
});
