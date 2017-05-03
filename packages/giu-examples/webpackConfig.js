// const fs = require('fs');
const path = require('path');
const webpack = require('webpack');  // eslint-disable-line
// const extractDocs = require('extract-docs');
// const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');

const fProduction = process.env.NODE_ENV === 'production';
const fSsr = !!process.env.SERVER_SIDE_RENDERING;

const cssLoader = {
  loader: 'css-loader',
  options: { minimize: fProduction },
};

const styleLoader = { loader: 'style-loader' };

module.exports = {

  // -------------------------------------------------
  // Input (entry point)
  // -------------------------------------------------
  entry: {
    demo1: ['./src/demo1.js'],
    demo2: ['./src/demo2.js'],
    index: ['./src/index.js'],
  },

  // -------------------------------------------------
  // Output
  // -------------------------------------------------
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(process.cwd(), './lib/public'),
    publicPath: '',
    libraryTarget: fSsr ? 'commonjs2' : undefined,
  },

  // -------------------------------------------------
  // Configuration
  // -------------------------------------------------
  devtool: fProduction || fSsr ? undefined : 'eval',
  target: fSsr ? 'node' : undefined,

  plugins: (() => {
    const out = [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(fProduction ? 'production' : 'development'),
        'process.env.SERVER_SIDE_RENDERING': JSON.stringify(fSsr),
      }),
    ];
    // if (fSsr) {
    //   const readme = extractDocs({
    //     template: './docs/templates/README.md',
    //     missingRefs: true,
    //     skipConditional: true,
    //   });
    //   out.push(new StaticSiteGeneratorPlugin('index', ['index.html'], {
    //     template: fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8'),
    //     readme,
    //   }));
    //   out.push(new StaticSiteGeneratorPlugin('demo1', ['demo1.html'], {
    //     template: fs.readFileSync(path.join(__dirname, 'demo1.html'), 'utf8'),
    //   }));
    // }
    return out;
  })(),

  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      loader: 'babel-loader',
      exclude: path.resolve(process.cwd(), 'node_modules'),
    }, {
      test: /\.(otf|eot|svg|ttf|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader',
    }, {
      test: /\.css$/,
      use: [styleLoader, cssLoader],
    }],
  },
};
