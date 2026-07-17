// Electron 28+ loads the app entry via native ESM `import()`.
// That bypasses `@babel/register`, so main.dev.js's extensionless
// Babel-style imports fail under Node's ESM resolver.
// Force CommonJS here so Babel can transpile main.dev.js on require.
require('@babel/register');
require('./main.dev.js');
