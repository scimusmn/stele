const path = require("path");
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {

  watch: true,

  target: 'electron-renderer',

  entry: {
    electron: './src/electron.js',
    index: './src/index.js',
  },

  // output: {
  //   filename: 'bundle.js',
  //   path: `${__dirname}/../dist`,
  //   publicPath: '',
  // },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist'),
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
    new HtmlWebpackPlugin({
      inject: true,
      template: 'public/index.html',
    }),
    new ExtractTextPlugin({
      filename: 'bundle.css',
      disable: false,
      allChunks: true,
    }),
  ],

  resolve: {
    extensions: ['.js', '.json', '.jsx'],
  },

};
