/* eslint-disable prefer-const */
/* eslint-disable no-console */

const path = require('path');
const fs = require('fs-extra');

const libPath = lib => path.dirname(require.resolve(`${lib}/package.json`));

let dstPath;

const LIBS = [
  '@fortawesome/fontawesome-svg-core',
  'typeface-gloria-hallelujah',
  'typeface-roboto',
  'material-design-lite',
];
LIBS.forEach(lib => {
  dstPath = `./public/deps/${lib}`;
  fs.removeSync(dstPath);
  fs.copySync(libPath(lib), dstPath, { dereference: true });
});
