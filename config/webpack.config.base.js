//
// Base webpack config used across other specific configs
//
import path from 'path';
import webpack from 'webpack';

export default {

  module: {
    rules: [
      {
        test: /\.jsx?$/,
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

  entry: path.join(__dirname, '..', 'src/renderer/index'),

  output: {
    path: path.join(__dirname, '..', 'src'),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2',
  },

  target: 'electron-renderer',

  // Determine the array of extensions that should be used to resolve modules.
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),

    new webpack.NamedModulesPlugin(),
  ],
};
