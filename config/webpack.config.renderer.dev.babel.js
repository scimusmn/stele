/* eslint global-require: off, import/no-dynamic-require: off */

//
// Development Webpack config for Electron Renderer process, using Hot Module Replacement
//

import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import chalk from 'chalk';
import merge from 'webpack-merge';
import { spawn, execSync } from 'child_process';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from '../scripts/CheckNodeEnv';

// Ensure we're setting the correct environment
CheckNodeEnv('development');

// Development Hot Module Replacement server
const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/dist`;

//
// Define DLL helper configs
//
const dll = path.join(__dirname, '..', 'dll');
const manifest = path.resolve(dll, 'renderer.json');
const requiredByDLLConfig = module.parent.filename.includes(
  'webpack.config.renderer.dev.dll',
);
// Warn if the DLL is not built
if (!requiredByDLLConfig && !(fs.existsSync(dll) && fs.existsSync(manifest))) {
  console.log(
    chalk.black.bgYellow.bold(
      'The DLL files are missing. Sit back while we build them for you with "yarn build-dll"',
    ),
  );
  execSync('yarn build-dll');
}

export default merge.smart(baseConfig, {
  // Good balance of rebuild speed and dev helpfulness. Copying our approach from create-react-app
  // See the discussion in https://github.com/facebook/create-react-app/issues/343
  devtool: 'cheap-module-source-map',

  mode: 'development',

  output: {
    publicPath: `http://localhost:${port}/dist/`,
    filename: 'renderer.dev.js',
  },

  module: {
    rules: [
      {
        test: /\.global\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: '[name]__[local]__[hash:base64:5]',
              sourceMap: true,
            },
          },
        ],
      },
      // Add SASS support  - compile all .global.scss files and pipe it to style.css
      {
        test: /\.global\.(scss|sass)$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      // SASS support - compile all other .scss files and pipe it to style.css
      {
        test: /^((?!\.global).)*\.(scss|sass)$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: '[name]__[local]__[hash:base64:5]',
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml',
          },
        },
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: 'url-loader',
      },
    ],
  },

  plugins: [
    requiredByDLLConfig
      ? null
      : new webpack.DllReferencePlugin({
        context: path.join(__dirname, '..', 'dll'),
        manifest: require(manifest),
        sourceType: 'var',
      }),

    new webpack.HotModuleReplacementPlugin({
      multiStep: true,
    }),

    new webpack.NoEmitOnErrorsPlugin(),

    //
    // Create global constants which can be configured at compile time.
    //
    // Useful for allowing different behaviour between development builds and release builds
    //
    // NODE_ENV should be production so that modules do not perform certain development checks
    //
    // By default, use 'development' as NODE_ENV. This can be overridden with 'staging',
    // for example, by changing the ENV variables in the npm scripts
    //
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },

  devServer: {
    port,
    publicPath,
    // Enable gzip compression of generated files.
    compress: true,
    // Help with DLL features
    noInfo: true,
    stats: 'errors-only',
    inline: true,
    lazy: false,
    // Enable Hot Module Reload
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    // TODO: update this when we refactor React app folder
    contentBase: path.join(__dirname, 'dist'),
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/,
      poll: 100,
    },
    historyApiFallback: {
      verbose: true,
      disableDotRule: false,
    },

    // Start the main Electron process before running the dev server
    before() {
      if (process.env.START_HOT) {
        console.log('Starting Main Process...');
        spawn('npm', ['run', 'start-main-dev'], {
          shell: true,
          env: process.env,
          stdio: 'inherit',
        })
          .on('close', code => process.exit(code))
          .on('error', spawnError => console.error(spawnError));
      }
    },
  },
});
