//
// Production Webpack config for Electron Renderer process
//
import path from 'path';
import webpack from 'webpack';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';
import CheckNodeEnv from '../scripts/CheckNodeEnv';
import baseConfig from './webpack.config.base';
import deleteSourceMaps from '../scripts/delete-source-maps';
import webpackPaths from './webpack.paths';

// Ensure we're setting the correct environment
CheckNodeEnv('production');
deleteSourceMaps();

const devtoolsConfig = process.env.DEBUG_PROD === 'true'
  ? {
    devtool: 'source-map',
  }
  : {};

export default merge(baseConfig, {
  ...devtoolsConfig,

  mode: 'production',

  target: ['electron-renderer'],

  externals: {
    serialport: 'commonjs serialport',
  },
  entry: [
    'core-js',
    'regenerator-runtime/runtime',
    path.join(webpackPaths.srcRendererPath, 'index.js'),
  ],

  output: {
    path: webpackPaths.distRendererPath,
    publicPath: './',
    filename: 'renderer.js',
    library: {
      type: 'umd',
    },
  },

            },
          },
        }),
      ],
  // Optimize code for production build
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
      new CssMinimizerPlugin(),
    ],
  },

  plugins: [
    //
    // Create global constants which can be configured at compile time.
    //
    // Useful for allowing different behaviour between development builds and release builds
    //
    // NODE_ENV should be production so that modules do not perform certain development checks
    //
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),

    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),

    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),
  ],
});
