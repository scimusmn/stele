const merge = require('webpack-merge');
const base = require('./webpack.config.base');

module.exports = env => merge(base(env), {
  devtool: 'source-map',
});
