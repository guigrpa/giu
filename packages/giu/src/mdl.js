/* eslint-disable global-require */

// Wrap in try/catch, since the material library assumes that it
// lives in the browser (and we might be SSR'ing)
try {
  require('./vendor/material');
} catch (err) {
  /* ignore */
}
require('./vendor/material.css');
