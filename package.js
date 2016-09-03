/* eslint-disable strict, indent, max-len, quote-props */
'use strict';

// ===============================================
// Basic config
// ===============================================
const NAME = 'giu';
const VERSION = '0.7.1';
const DESCRIPTION = 'A collection of React components and utilities';
const KEYWORDS = ['React', 'components', 'collection', 'forms', 'inputs', 'ssr', 'i18n'];

// ===============================================
// Helpers
// ===============================================
const runMultiple = arr => arr.join(' && ');
const runTestCov = env => {
  const envStr = env != null ? `${env} ` : '';
  return runMultiple([
    `cross-env ${envStr}nyc ava`,
    'mv .nyc_output/* .nyc_tmp/',
  ]);
};

const WEBPACK = 'webpack --config examples/webpackConfig.js --progress --display-chunks';

// ===============================================
// Specs
// ===============================================
const specs = {

  // -----------------------------------------------
  // General
  // -----------------------------------------------
  name: NAME,
  version: VERSION,
  description: DESCRIPTION,
  main: 'lib/index.js',
  author: 'Guillermo Grau Panea',
  license: 'MIT',
  keywords: KEYWORDS,
  homepage: `https://github.com/guigrpa/${NAME}#readme`,
  bugs: { url: `https://github.com/guigrpa/${NAME}/issues` },
  repository: { type: 'git', url: `git+https://github.com/guigrpa/${NAME}.git` },

  // -----------------------------------------------
  // Scripts
  // -----------------------------------------------
  scripts: {

    // Top-level
    start:                      'babel-node examples/server',
    compile:                    runMultiple([
                                  'node package',
                                  'rm -rf ./lib ./libEs6',
                                  'babel -d lib src',
                                  'cp src/*.css lib',
                                  'cp src/components/*.css lib/components',
                                  'cp src/inputs/*.css lib/inputs',
                                  'cp -r src/fonts lib/fonts',
                                  'cp -r src libEs6',
                                ]),
    docs:                       'extract-docs --template docs/templates/README.md --output README.md',
    build:                      runMultiple([
                                  'npm run lint',
                                  'npm run compile',
                                  'npm run docs',
                                  'npm run buildExamplesSsr',
                                  // 'npm run test',
                                  'npm run xxl',
                                ]),
    travis:                     runMultiple([
                                  'npm run compile',
                                  // 'npm run testCovFull',
                                ]),

    // Examples
    buildExamples:              'npm run buildExamplesSsr',
    buildExamplesDev:           runMultiple([    // demo1.js OK, index.js NOK (use buildExamplesSsrDev instead)
                                  'npm run buildExamplesCopy',
                                  'cp examples/*.html docs/',
                                  `${WEBPACK} --watch`,
                                ]),
    buildExamplesSsr:           runMultiple([
                                  'npm run buildExamplesCopy',
                                  `cross-env NODE_ENV=production SERVER_SIDE_RENDERING=true ${WEBPACK} -p`,
                                ]),
    buildExamplesSsrDev:        runMultiple([
                                  'npm run buildExamplesCopy',
                                  `cross-env SERVER_SIDE_RENDERING=true ${WEBPACK} --watch`,
                                ]),
    buildExamplesCopy:          runMultiple([
                                  'cp -r examples/stylesheets docs/',
                                  'cp examples/favicon.ico docs/',
                                ]),

    // Static analysis
    lint:                       'eslint src',
    xxl:                        "xxl --src \"[\\\"src\\\"]\"",

    // Testing - general
    test:                       'npm run testCovFull',
    testCovFull:                runMultiple([
                                  'npm run testCovPrepare',
                                  'npm run testDev',
                                  'npm run testProd',
                                  'npm run testCovReport',
                                ]),
    testCovFast:                runMultiple([
                                  'npm run testCovPrepare',
                                  'npm run testDev',
                                  'npm run testCovReport',
                                ]),

    // Testing - steps
    ava:                        'ava --watch',
    testCovPrepare:             runMultiple([
                                  'rm -rf ./coverage .nyc_output .nyc_tmp',
                                  'mkdir .nyc_tmp',
                                ]),
    testDev:                    runTestCov('NODE_ENV=development'),
    testProd:                   runTestCov('NODE_ENV=production'),
    testCovReport:              runMultiple([
                                  'cp .nyc_tmp/* .nyc_output/',
                                  'nyc report --reporter=html --reporter=lcov --reporter=text',
                                ]),
  },


  // -----------------------------------------------
  // Deps
  // -----------------------------------------------
  engines: {
    node: '>=4',
  },

  peerDependencies: {
    react:                            '^15.3.0',
    'react-dom':                      '^15.3.0',
    'react-addons-pure-render-mixin': '^15.3.0',
    moment: '^2.0.0',
  },

  dependencies: {
    timm: '1.0.0',

    redux: '3.5.2',
    'redux-thunk': '2.1.0',

    'lodash': '4.15.0',  // only parts of it will be included

    'font-awesome': '4.6.3',
    'react-sortable-hoc': '0.0.7',

    tinycolor2: '1.4.1',
    filesize: '3.3.0',
    keycode: '2.1.1',
  },

  devDependencies: {
    storyboard: '2.0.2',
    'xxl': '^0.1.0',
    'cross-env': '^1.0.8',
    // 'diveSync': '0.3.0',

    moment: '^2.0.0',
    faker: '3.0.1',

    // React
    react:                              '^15.3.0',
    'react-dom':                        '^15.3.0',
    'react-addons-pure-render-mixin':   '^15.3.0',
    'react-addons-perf':                '^15.3.0',

    // Babel (except babel-eslint)
    'babel-cli': '6.11.4',
    'babel-core': '6.11.4',
    'babel-polyfill': '6.9.1',
    'babel-preset-es2015': '6.9.0',
    'babel-preset-stage-0': '6.5.0',
    'babel-preset-react': '6.11.1',

    // Webpack + loaders (+ related stuff)
    webpack: '1.13.1',
    'webpack-dev-middleware': '1.6.1',
    'webpack-hot-middleware': '2.12.2',
    'babel-loader': '6.2.4',
    'file-loader': '0.8.5',
    'css-loader': '0.23.1',
    'style-loader': '0.13.1',
    // 'extract-text-webpack-plugin': '1.0.1',
    'static-site-generator-webpack-plugin': '2.1.0',

    // Linting
    'eslint': '^2.13.1',
    'eslint-config-airbnb': '^9.0.0',
    'eslint-plugin-react': '^5.2.2',
    'eslint-plugin-jsx-a11y': '^1.5.3',
    'eslint-plugin-import': '^1.9.2',
    'babel-eslint': '^6.1.2',

    // Documentation
    'extract-docs': '^1.2.0',
    'marked': '0.3.5',
    'highlight.js': '9.5.0',
    'fontfaceobserver': '1.7.1',

    // Testing
    'ava': '0.15.2',
    'nyc': '^6.1.1',
  },

  // -----------------------------------------------
  // Other configs
  // -----------------------------------------------
  ava: {
    'files': [
      './test/test.js',
    ],
    'babel': 'inherit',
  },
};

// ===============================================
// Build package.json
// ===============================================
const _sortDeps = deps => {
  const newDeps = {};
  for (const key of Object.keys(deps).sort()) {
    newDeps[key] = deps[key];
  }
  return newDeps;
};
specs.dependencies = _sortDeps(specs.dependencies);
specs.devDependencies = _sortDeps(specs.devDependencies);
const packageJson = `${JSON.stringify(specs, null, '  ')}\n`;
require('fs').writeFileSync('package.json', packageJson);

/* eslint-enable strict, indent, max-len, quote-props */
