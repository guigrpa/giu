/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const webpack = require('webpack'); // eslint-disable-line
const extractDocs = require('extract-docs'); // eslint-disable-line
const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin'); // eslint-disable-line

module.exports = (env = {}) => {
  const fProduction = env.NODE_ENV === 'production';
  const fSsr = !!env.SERVER_SIDE_RENDERING;

  const PAGES = ['demo1', 'demo2', 'demo3', 'index'];

  console.log(`Compiling for production: ${fProduction}`);
  console.log(`Compiling for SSR: ${fSsr}`);
  console.log(`Building: ${PAGES.join(', ')}`);

  const cssLoader = {
    loader: 'css-loader',
    options: { minimize: fProduction },
  };

  const styleLoader = { loader: 'style-loader' };

  const entry = {};
  PAGES.forEach(page => {
    entry[page] = [`./src/${page}.js`];
  });

  return {
    // -------------------------------------------------
    // Input (entry points)
    // -------------------------------------------------
    entry,

    // -------------------------------------------------
    // Output
    // -------------------------------------------------
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(process.cwd(), './lib/public'),
      publicPath: '',
      libraryTarget: fSsr ? 'umd' : undefined,
    },

    // -------------------------------------------------
    // Configuration
    // -------------------------------------------------
    devtool: fProduction || fSsr ? undefined : 'eval',

    plugins: (() => {
      const out = [
        new webpack.DefinePlugin({
          'process.env.SERVER_SIDE_RENDERING': JSON.stringify(fSsr),
        }),
      ];
      if (fSsr) {
        PAGES.forEach(page => {
          const templatePath = path.join(__dirname, `src/public/${page}.html`);
          const locals = { template: fs.readFileSync(templatePath, 'utf8') };
          if (page === 'index') {
            locals.readme = extractDocs({
              template: '../../docs/templates/README.md',
              basePath: '../..',
              missingRefs: true,
              skipConditional: true,
            });
          }
          out.push(
            new StaticSiteGeneratorPlugin({
              entry: page,
              paths: [`${page}.html`],
              locals,
            })
          );
        });
      }
      return out;
    })(),

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          loader: 'babel-loader',
          exclude: path.resolve(process.cwd(), 'node_modules'),
        },
        {
          test: /\.(otf|eot|svg|ttf|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'file-loader',
        },
        {
          test: /\.css$/,
          use: fSsr ? [cssLoader] : [styleLoader, cssLoader],
        },
      ],
    },
  };
};
