const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const fProduction = process.env.NODE_ENV === 'production';

const _entry = (entry) => [
  // 'webpack-hot-middleware/client?reload=true',
  entry,
];

const MOMENT_LANGS = ['en-gb', 'ca', 'es', 'de'];

const _styleLoader = loaderDesc => ExtractTextPlugin.extract('style-loader', loaderDesc);

module.exports = {

  // -------------------------------------------------
  // Input (entry point)
  // -------------------------------------------------
  entry: {
    demo1: _entry('./examples/demo1.js'),
    demo2: _entry('./examples/demo2.js'),
  },

  // -------------------------------------------------
  // Output
  // -------------------------------------------------
  output: {
    filename: '[name].bundle.js',

    // Where PRODUCTION bundles will be stored
    path: path.resolve(process.cwd(), 'examples/public'),

    publicPath: '',
  },

  // -------------------------------------------------
  // Configuration
  // -------------------------------------------------
  devtool: fProduction ? undefined : 'eval',

  resolve: {
    // Add automatically the following extensions to required modules
    extensions: ['', '.jsx', '.js'],
  },

  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(fProduction ? 'production' : 'development'),
    }),
    new webpack.ContextReplacementPlugin(
      /moment[\\\/]locale$/,
      new RegExp(`.[\\\/](${MOMENT_LANGS.join('|')})`)
    ),
    new ExtractTextPlugin('[name].bundle.css'),
  ],

  module: {
    loaders: [{
      test: /\.(js|jsx)$/,
      loader: 'babel',
      exclude: path.resolve(process.cwd(), 'node_modules'),
    }, {
      test: /\.(otf|eot|svg|ttf|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file',
    }, {
      test: /\.css$/,
      loader: _styleLoader('css'),
    }],
  },
};
