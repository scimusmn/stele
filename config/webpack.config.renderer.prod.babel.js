//
// Production Webpack config for Electron Renderer process
//
import path from 'path';
import webpack from 'webpack';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from '../scripts/CheckNodeEnv';
import deleteSourceMaps from '../scripts/delete-source-maps';

// Ensure we're setting the correct environment
CheckNodeEnv('production');
deleteSourceMaps();

export default merge(baseConfig, {
  mode: 'production',

  // Create the slower but suitable for production source-map
  devtool: 'source-map',

  externals: {
    serialport: 'commonjs serialport',
  },

  output: {
    // Absolute directory path to the compiled renderer files
    path: path.join(__dirname, '..', 'src/dist'),
    // Path to generated images, fonts, and other files. Relative to renderer source
    publicPath: '../dist/',
    filename: 'renderer.prod.js',
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
