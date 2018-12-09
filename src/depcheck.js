import depcheck from 'depcheck';
import path from 'path';

const options = {
  ignoreBinPackage: false, // ignore the packages with bin entry
  skipMissing: false, // skip calculation of missing dependencies
  ignoreDirs: [ // folder with these names will be ignored
    'dist',
    'dll',
    'release',
    'src/dist',
  ],
  ignoreMatches: [ // ignore dependencies that matches these globs
    'grunt-*',
    '*.prod.js'
  ],
  parsers: { // the target parsers
    '*.js': depcheck.parser.es6,
    '*.jsx': depcheck.parser.jsx
  },
  specials: [ // the target special parsers
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
