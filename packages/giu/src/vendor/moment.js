/* eslint-disable global-require */

// moment is not a mandatory dependency

let moment;
try {
  moment = require('moment');
} catch (err) { /* ignore */ }

module.exports = moment;
