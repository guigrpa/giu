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
  '--color',
  '--progress',
  // '--display-modules',
  '--display-chunks',
].join(' ');
const WEBPACK = `webpack --config examples/webpackConfig.js ${WEBPACK_OPTS}`;

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
    timm: '^1.2.1',

    redux: '3.5.2',
    'redux-thunk': '2.1.0',

    'lodash': '4.15.0',  // only parts of it will be included

    'font-awesome': '4.6.3',
    'typeface-gloria-hallelujah': '0.0.22',
    'typeface-roboto': '0.0.22',

    'react-sortable-hoc': '0.0.8',

    tinycolor2: '1.4.1',
    filesize: '3.3.0',
    keycode: '2.1.1',
    unorm: '1.4.1',
  },

  devDependencies: {
    storyboard: '^3.0.0',
    'storyboard-preset-console': '^3.0.0',
    'xxl': '^1.0.0',
    'cross-env': '^1.0.8',
    // 'diveSync': '0.3.0',

    moment: '^2.0.0',
    faker: '3.0.1',

    // React
    react: '^15.4.0',
    'react-dom': '^15.4.0',

    // Babel (except babel-eslint)
    'babel-cli': '6.22.2',
    'babel-core': '6.22.1',
    'babel-eslint': '7.0.0',
    'babel-polyfill': '6.22.0',
    'babel-preset-es2015': '6.22.0',
    'babel-preset-stage-0': '6.22.0',
    'babel-preset-react': '6.22.0',

    // Webpack + loaders (+ related stuff)
    webpack: '1.13.2',
    'webpack-dev-middleware': '1.8.4',
    'webpack-hot-middleware': '2.13.0',
    'babel-loader': '6.2.5',
    'file-loader': '0.9.0',
    'css-loader': '0.25.0',
    'style-loader': '0.13.1',
    // 'extract-text-webpack-plugin': '1.0.1',
    'static-site-generator-webpack-plugin': '2.1.0',

    // Linting
    'eslint': '3.8.1',
    'eslint-config-airbnb': '12.0.0',
    'eslint-plugin-flowtype': '2.20.0',
    'eslint-plugin-import': '1.16.0',
    'eslint-plugin-jsx-a11y': '2.2.3',
    'eslint-plugin-react': '6.4.1',

    // Documentation
    'extract-docs': '1.4.0',
    'marked': '0.3.5',
    'highlight.js': '9.5.0',
    'fontfaceobserver': '1.7.1',

    // Testing
    'jest': '17.0.3',
    'babel-jest': '17.0.2',
    'jest-html': '^1.3.2',
    'react-test-renderer': '15.4.0',

    // Coverage testing
    'nyc': '8.4.0',
    coveralls: '2.11.15',

    // Other tools
    'flow-bin': '0.36.0',
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
