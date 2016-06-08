/* eslint-disable strict, indent, max-len, quote-props */
'use strict';

// ===============================================
// Basic config
// ===============================================
const NAME = 'giu';
const VERSION = '0.6.0';
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
    buildExamplesDev:           runMultiple([
                                  'npm run buildExamplesClean',
                                  'npm run buildExamplesCopy',
                                  'cp examples/*.html examples/public/',
                                  `${WEBPACK} --watch`,
                                ]),
    buildExamplesSsr:           runMultiple([
                                  'npm run buildExamplesClean',
                                  'npm run buildExamplesCopy',
                                  `cross-env NODE_ENV=production SERVER_SIDE_RENDERING=true ${WEBPACK} -p`,
                                ]),
    buildExamplesSsrDev:        runMultiple([
                                  'npm run buildExamplesClean',
                                  'npm run buildExamplesCopy',
                                  `cross-env SERVER_SIDE_RENDERING=true ${WEBPACK} --watch`,
                                ]),
    buildExamplesClean:         runMultiple([
                                  'rm -rf ./examples/public',
                                  'cd examples',
                                  'mkdir public',
                                  'cd ..',
                                ]),
    buildExamplesCopy:          runMultiple([
                                  'cp -r examples/stylesheets examples/public/',
                                  'cp examples/favicon.ico examples/public/',
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
    react: '^0.14.0 || ^15.0.0',
    'react-addons-pure-render-mixin': '^0.14.0 || ^15.0.0',
    moment: '^2.0.0',
  },

  dependencies: {
    timm: '^0.6.1',
    'font-awesome': '4.6.1',
    redux: '3.5.2',
    'redux-thunk': '2.0.1',
    tinycolor2: '1.3.0',
    filesize: '3.3.0',
    keycode: '2.1.1',
  },

  devDependencies: {
    storyboard: '^1.0.0',
    'xxl': '^0.1.0',
    'cross-env': '^1.0.7',
    // 'diveSync': '0.3.0',

    moment: '^2.0.0',

    // React
    react: '^15.0.0',
    'react-dom': '^15.0.0',
    'react-addons-pure-render-mixin': '^15.0.0',
    'react-addons-perf': '^15.0.0',

    // Babel (except babel-eslint)
    'babel-cli': '^6.6.5',
    'babel-core': '^6.7.2',
    'babel-polyfill': '^6.7.2',
    'babel-preset-es2015': '^6.6.0',
    'babel-preset-stage-0': '^6.5.0',
    'babel-preset-react': '^6.5.0',

    // Webpack + loaders (+ related stuff)
    webpack: '1.13.0',
    'webpack-dev-middleware': '1.6.1',
    'webpack-hot-middleware': '2.10.0',
    'babel-loader': '6.2.4',
    'file-loader': '0.8.5',
    'css-loader': '0.23.1',
    'style-loader': '0.13.1',
    // 'extract-text-webpack-plugin': '1.0.1',
    'static-site-generator-webpack-plugin': '2.1.0',

    // Linting
    'eslint': '^2.4.0',
    'eslint-config-airbnb': '^6.2.0',
    'eslint-plugin-react': '^4.2.3',
    'babel-eslint': '^6.0.0',

    // Documentation
    'extract-docs': '^1.2.0',
    'marked': '0.3.5',
    'highlight.js': '9.4.0',
    'fontfaceobserver': '1.7.1',

    // Testing
    'ava': '^0.13.0',
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
