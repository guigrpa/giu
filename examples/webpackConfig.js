const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const extractDocs = require('extract-docs');
const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');
const fProduction = process.env.NODE_ENV === 'production';
const fSsr = !!process.env.SERVER_SIDE_RENDERING;

const _entry = (entry) => [
  // 'webpack-hot-middleware/client?reload=true',
  entry,
];

const MOMENT_LANGS = ['en-gb', 'ca', 'es', 'de'];

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

    libraryTarget: fSsr ? 'umd' : undefined,
  },

  // -------------------------------------------------
  // Configuration
  // -------------------------------------------------
  // devtool: fProduction ? undefined : 'eval',

  resolve: {
    // Add automatically the following extensions to required modules
    extensions: ['', '.jsx', '.js'],
  },

  plugins: (() => {
    const out = [
      // new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(fProduction ? 'production' : 'development'),
        'process.env.SERVER_SIDE_RENDERING': JSON.stringify(fSsr),
      }),
      new webpack.ContextReplacementPlugin(
        /moment[\\\/]locale$/,
        new RegExp(`.[\\\/](${MOMENT_LANGS.join('|')})`)
      ),
    ];
    if (fSsr) {
      out.push(new StaticSiteGeneratorPlugin('demo1', ['demo1.html'], {
        template: fs.readFileSync(path.join(__dirname, 'demo1.html'), 'utf8'),
      }));
      // const inlineDocs = require('./extractInlineDocs');
      const readme = extractDocs({ template: './docs/templates/README.md', missingRefs: true });
      out.push(new StaticSiteGeneratorPlugin('demo2', ['demo2.html'], {
        template: fs.readFileSync(path.join(__dirname, 'demo2.html'), 'utf8'),
        readme,
      }));
    }
    return out;
  })(),

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
      loader: fSsr ? 'css' : 'style!css',
    }],
  },
};
