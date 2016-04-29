import path                 from 'path';
import webpack              from 'webpack';

const _entry = (entry) => [
  // 'webpack-hot-middleware/client?reload=true',
  entry,
];

export default {

  // -------------------------------------------------
  // Input (entry point)
  // -------------------------------------------------
  entry: {
    example1: _entry('./examples/example1.js'),
  },

  // -------------------------------------------------
  // Output
  // -------------------------------------------------
  output: {
    filename: '[name].bundle.js',

    // Where PRODUCTION bundles will be stored
    path: path.resolve(process.cwd(), 'public'),

    publicPath: '/',
  },

  // -------------------------------------------------
  // Configuration
  // -------------------------------------------------
  devtool: 'eval',

  resolve: {
    // Add automatically the following extensions to required modules
    extensions: ['', '.jsx', '.js'],
  },

  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
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
      loader: 'style!css',
    }, {
      test: /\.sass$/,
      loader: 'style!css!sass?indentedSyntax',
    }, {
      test: /\.png$/,
      loader: 'file',
    }, {
      test: /\.json$/,
      loader: 'json',
    }],
  },
};
