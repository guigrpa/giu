/* eslint-disable strict, indent, max-len, quote-props, quotes, no-underscore-dangle */

'use strict';

// ===============================================
// Basic config
// ===============================================
const NAME = 'giu';
const VERSION = '0.10.2';
const DESCRIPTION = 'A collection of React components and utilities';
const KEYWORDS = ['React', 'components', 'collection', 'forms', 'inputs', 'ssr', 'i18n'];

// ===============================================
// Helpers
// ===============================================
const runMultiple = (arr) => arr.join(' && ');
const runTestCov = (env, name) => {
  const envStr = env != null ? `${env} ` : '';
  return runMultiple([
    `cross-env ${envStr}jest --coverage`,
    `mv .nyc_output/coverage-final.json .nyc_tmp/coverage-${name}.json`,
    'rm -rf .nyc_output',
  ]);
};

const WEBPACK_OPTS = [
  '--config examples/webpackConfig.js',
  '--color',
  '--progress',
  // '--display-modules',
  '--display-chunks',
].join(' ');
const WEBPACK = `webpack ${WEBPACK_OPTS}`;

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
                                  'rm -rf ./lib',
                                  'mkdir lib',
                                  'babel --out-dir lib --ignore "**/__mocks__/**","**/__tests__/**" src',
                                  'cp src/*.css lib',
                                  // 'flow-copy-source -i "**/__mocks__/**" -i "**/__tests__/**" src lib',
                                  'cp src/components/*.css lib/components',
                                  'cp src/inputs/*.css lib/inputs',
                                  // 'cp src/api.js.flow lib/index.js.flow',
                                ]),
    docs:                       'extract-docs --template docs/templates/README.md --output README.md',
    build:                      runMultiple([
                                  'node package',
                                  'npm run lint',
                                  'npm run flow',
                                  'npm run test',
                                  'npm run compile',
                                  'npm run docs',
                                  'npm run buildExamplesSsr',
                                  'npm run xxl',
                                ]),
    travis:                     runMultiple([
                                  'npm run compile',
                                  'npm run test',
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
    flow:                       'flow check || exit 0',
    xxl:                        'xxl',

    // Testing - general
    jest:                       'jest --watch --coverage',
    'jest-html':                'jest-html --snapshot-patterns "src/**/*.snap"',
    test:                       'npm run testCovFull',
    testFast:                   'jest',
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
    testCovPrepare:             runMultiple([
                                  'rm -rf ./coverage .nyc_output .nyc_tmp',
                                  'mkdir .nyc_tmp',
                                ]),
    testDev:                    runTestCov('NODE_ENV=development', 'dev'),
    testProd:                   runTestCov('NODE_ENV=production', 'prod'),
    testCovReport:              runMultiple([
                                  'cp -r .nyc_tmp .nyc_output',
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
    react: '^15.3.0',
    'react-dom': '^15.3.0',
    moment: '^2.0.0',         // optional
  },

  dependencies: {
    timm: '^1.2.5',

    redux: '3.6.0',
    'redux-thunk': '2.2.0',

    'lodash': '4.17.4',  // only parts of it will be included

    'font-awesome': '4.7.0',
    'typeface-gloria-hallelujah': '0.0.22',
    'typeface-roboto': '0.0.22',

    'react-sortable-hoc': '0.0.8',

    tinycolor2: '1.4.1',
    filesize: '3.5.9',
    keycode: '2.1.1',
    unorm: '1.4.1',
  },

  devDependencies: {
    storyboard: '3.1.1',
    'storyboard-preset-console': '3.1.1',
    'xxl': '1.2.0',
    'cross-env': '^1.0.8',

    moment: '2.18.1',
    faker: '3.0.1',

    // React
    react: '^15.5.4',
    'react-dom': '^15.5.4',

    // Babel (except babel-eslint)
    'babel-cli': '6.24.1',
    'babel-core': '6.24.1',
    'babel-eslint': '7.2.3',
    // "babel-runtime": "6.23.0",
    // "babel-plugin-transform-runtime": "6.23.0",
    'babel-polyfill': '6.23.0',
    'babel-preset-es2015': '6.24.1',
    'babel-preset-stage-0': '6.24.1',
    'babel-preset-react': '6.24.1',

    // Webpack + loaders (+ related stuff)
    webpack: '2.4.1',
    'babel-loader': '7.0.0',
    'file-loader': '0.11.1',
    'css-loader': '0.28.1',
    'style-loader': '0.17.0',
    // 'extract-text-webpack-plugin': '1.0.1',
    'static-site-generator-webpack-plugin': '2.1.0',

    // Linting
    'eslint': '3.19.0',
    'eslint-config-airbnb': '12.0.0',
    'eslint-plugin-flowtype': '2.32.1',
    'eslint-plugin-import': '1.16.0',
    'eslint-plugin-jsx-a11y': '2.2.3',
    'eslint-plugin-react': '6.10.3',

    // Documentation
    'extract-docs': '1.4.0',
    'marked': '0.3.6',
    'highlight.js': '9.11.0',
    'fontfaceobserver': '1.7.1',

    // Testing
    'jest': '17.0.3',
    'babel-jest': '17.0.2',
    'jest-html': '^1.3.4',
    'react-test-renderer': '15.5.4',

    // Coverage testing
    'nyc': '8.4.0',
    coveralls: '2.13.1',

    // Other tools
    'flow-bin': '0.45.0',
    'flow-copy-source': '1.1.0',
  },

  // -----------------------------------------------
  // Other configs
  // -----------------------------------------------
  jest: {
    testRegex: 'src/.*__tests__/.*\\.(test|spec)\\.(js|jsx)$',
    moduleNameMapper: {
      '^.+\\.(css|less|sass)$': '<rootDir>/test/emptyObject.js',
      '^.+\\.(gif|ttf|eot|svg)$': '<rootDir>/test/emptyString.js',
    },
    coverageDirectory: '.nyc_output',
    coverageReporters: ['json', 'text', 'html'],
    snapshotSerializers: ['<rootDir>/node_modules/jest-html'],
    collectCoverageFrom: [
      'src/**/*.js',
      'src/vendor/**',
      '!test/**',
      '!**/webpack*',
      '!**/node_modules/**',
      '!**/__tests__/**',
      '!**/__mocks__/**',
    ],
    setupTestFrameworkScriptFile: './test/setup.js',
  },
};

// ===============================================
// Build package.json
// ===============================================
const _sortDeps = (deps) => {
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
