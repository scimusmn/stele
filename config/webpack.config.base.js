const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

module.exports = env => ({
  //
  // We compile two applications:
  //   - The Electron application
  //   - The React application that the Electron system views
  //
  entry: {
    electron: './src/electron.js',
    index: './src/index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist'),
  },

  //
  // Webpack provides a native electron target for our application code
  // https://webpack.js.org/configuration/target/
  //
  target: 'electron-renderer',

  //
  // Hardcode development process
  //
  // TODO: read environment and add it here correctly
  //
  mode: env,

  //
  // Don't overwrite the node filesystem variables
  //
  // This allows the electron process to use the __dirname variable
  // to find the path to the compiled React bundle.
  //
  node: {
    __dirname: false,
    __filename: false,
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/react'],
        },
      },
      {
        test: /\.(html)$/,
        loader: 'html-loader',
        options: {
          attrs: [':data-src'],
        },
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          loader: 'css-loader',
          options: {
            modules: true,
          },
        }),
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        query: {
          name: '[name].[ext]?[hash]',
        },
      },
    ],
  },

  plugins: [
    //
    // Build the index.html file in our dist folder
    //
    // We set injection to false, otherwise both the compiled
    // React and Electron files would be included in the HTML.
    // Only the React file should be added.
    //
    new HtmlWebpackPlugin({
      inject: false,
      template: 'src/index.html',
    }),
    new ExtractTextPlugin({
      filename: 'bundle.css',
      disable: false,
      allChunks: true,
    }),
    new FriendlyErrorsWebpackPlugin({ clearConsole: env === 'development' }),
  ],

});
