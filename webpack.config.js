const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require('css-minimizer-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = {
  plugins: [
    new BrowserSyncPlugin({
      proxy: 'dmplayer-electron.test',
      host: 'localhost',
      port: 3000,
      notify: false,
      files: [
        './assets/scss/**/*.scss',
        './assets/scss/**/**/*.scss',
        './assets/scss/site.scss',
        './assets/js/**/*.js',
        './assets/js/site.js',
      ],
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "css/site.css",
      ignoreOrder: false,
    }),
    new OptimizeCSSAssetsPlugin({}),
    new TerserJSPlugin({
      terserOptions: {
        output: {
          comments: false,
        },
      },
      extractComments: false,
    }),
  ],
  entry: {
    site: ['./assets/js/site.js', './assets/scss/site.scss'],
  },
  output: {
    filename: 'js/site.js',
    path: path.resolve('./dist/'),
    clean: true
  },
  module: {
    rules: [{
      test: /\.[c|s][s|a|c]ss?$/i,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            url: false,
            sourceMap: true
          }
        },
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true
          }
        }
      ],
    },
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: ["babel-loader", "source-map-loader"]
    }
    ]
  },
  devtool: 'source-map',
  mode: "production",
  watch: true,
};