const merge = require('webpack-merge');
const base = require('./webpack.config.base');

module.exports = env => merge(base(env), {
  devtool: 'cheap-eval-source-map',
});
