//
// Base webpack config used across other specific configs
//
import webpack from 'webpack';
import webpackPaths from './webpack.paths';
// eslint-disable-next-line import/no-relative-packages
import { dependencies as externals } from '../release/app/package.json';

export default {
  externals: [...Object.keys(externals || {})],

  stats: 'errors-only',

  target: 'electron-renderer',

  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx)?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },

  output: {
    path: webpackPaths.srcPath,
    // https://github.com/webpack/webpack/issues/1114
    library: {
      type: 'commonjs2',
    },
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [webpackPaths.srcPath, 'node_modules'],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
  ],
};
