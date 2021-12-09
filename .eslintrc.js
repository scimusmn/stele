//
// Set Javascript style rules defined by ESLint
//
// Configure ESLint to help keep our code in alignments with our style guidelines:
// https://smm.atlassian.net/wiki/spaces/MED/pages/6488251/Code+Style+Guide
//
module.exports = {
  extends: 'airbnb',
  parser: '@babel/eslint-parser',
  parserOptions: {
    sourceType: 'module',
    allowImportExportEverywhere: true,
  },
  env: {
    browser: true,
    node: true,
  },
  rules: {
    'function-paren-newline': ['error', 'consistent'],
    'no-console': 'off',
    'import/no-extraneous-dependencies': 'off',
    'react/jsx-filename-extension': [
      1,
      {
        extensions: [
          '.js',
          '.jsx',
        ],
      },
    ],
    'promise/param-names': 'error',
    'promise/always-return': 'error',
    'promise/catch-or-return': 'error',
    'promise/no-native': 'off',
  },
  plugins: ['import', 'promise', 'compat', 'react'],
  settings: {
    polyfills: ['promises'],
    'import/resolver': {
      webpack: {
        config: 'config/webpack.config.eslint.js',
      },
    },
  },
};
