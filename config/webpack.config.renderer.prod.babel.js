//
// Production Webpack config for Electron Renderer process
//
import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import merge from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from '../scripts/CheckNodeEnv';

// Ensure we're setting the correct environment
CheckNodeEnv('production');

export default merge.smart(baseConfig, {
  mode: 'production',

  // Create the slower but suitable for production source-map
  devtool: 'source-map',

  output: {
    // Absolute directory path to the compiled renderer files
    path: path.join(__dirname, '..', 'src/dist'),
    // Path to generated images, fonts, and other files. Relative to renderer source
    publicPath: '../dist/',
    filename: 'renderer.prod.js',
  },

  // Optimize code for production build
  optimization: {
    minimizer: process.env.E2E_BUILD
      ? []
      : [
        new TerserPlugin({
          parallel: true,
          sourceMap: true,
          cache: true,
        }),
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            map: {
              inline: false,
              annotation: true,
            },
          },
        }),
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
