import { dateTimeFormat }   from '../gral/dates';

/* --
```js
// Generic
isRequired() // same as the 'required' attribute, but allowing customisation
isEqualTo(password, 'password')
isOneOf(['rabbit', 'cow', 'eagle'])

// Strings
hasAtLeastChars(5)
hasAtMostChars(20)
hasLengthWithinRange(5, 20)
isEmail()
isUrl()
matchesPattern(/[-+]?[0-9]*\.?[0-9]+/)

// Numbers
isNumber()
isGreaterThanOrEqual(0) // or: isGte(0)
isLowerThanOrEqual(1000) // or: isLte(1000)
isWithinRange(0, 1000)

// Dates and times
isDate()
```
-- */

// ==========================================
// Special `isRequired`
// ==========================================
const isRequired = (msg) => ({
  fInternal: true,
  id: 'isRequired',
  getErrorMessage: _val => buildError(msg, 'is required', _val),
});

const isEqualTo = (anotherAttrVal, anotherAttrName, msg) => ({
  fInternal: false,
  id: 'isEqualTo',
  validate: val => (
    val === anotherAttrVal
      ? undefined
      : buildError(msg, `must be equal to ${anotherAttrName}`, val)
  ),
});

const isOneOf = (items, msg) => ({
  fInternal: false,
  id: 'isOneOf',
  validate: val => (
    items.indexOf(val) >= 0
      ? undefined
      : buildError(msg, `must be one of the following: ${items.join(', ')}`, val, items)
  ),
});

// ==========================================
// Strings
// ==========================================
const hasAtLeastChars = (min, msg) => ({
  fInternal: false,
  id: 'hasAtLeastChars',
  validate: val => (
    val.length >= min
      ? undefined
      : buildError(msg, `must have at least ${min} character${min === 1 ? '' : 's'}`,
          val, { min })
  ),
});

const hasAtMostChars = (max, msg) => ({
  fInternal: false,
  id: 'hasAtMostChars',
  validate: val => (
    val.length <= max
      ? undefined
      : buildError(msg, `must have at most ${max} character${max === 1 ? '' : 's'}`,
          val, { max })
  ),
});

const hasLengthWithinRange = (min, max, msg) => ({
  fInternal: false,
  id: 'hasLengthWithinRange',
  validate: val => (
    val.length >= min && val.length <= max
      ? undefined
      : buildError(msg, `must be between ${min} and ${max} characters long (inclusive)`,
          val, { min, max })
  ),
});

const isEmail = (msg) => ({
  fInternal: false,
  id: 'isEmail',
/* eslint-disable max-len */
  validate: val => (
    /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i
    .test(val)
      ? undefined
      : buildError(msg, 'must be a valid email address', val)
  ),
/* eslint-enable max-len */
});

const isUrl = (msg) => ({
  fInternal: false,
  id: 'isUrl',
/* eslint-disable max-len, no-useless-escape */
  validate: val => (
    /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
    .test(val)
      ? undefined
      : buildError(msg, 'must be a valid URL', val)
  ),
/* eslint-enable max-len, no-useless-escape */
});

const matchesPattern = (pattern, msg) => ({
  fInternal: false,
  id: 'matchesPattern',
  validate: val => (
    val.match(pattern)
      ? undefined
      : buildError(msg, 'is invalid', pattern, val, { pattern })
  ),
});

// ==========================================
// Number
// ==========================================

// Would really be useful only for text inputs
const isNumber = (msg) => ({
  fInternal: true,
  id: 'isNumber',
  validate: _val => (
    _val.length && !isNaN(Number(_val))
      ? undefined
      : buildError(msg, 'must be a valid number', _val)
  ),
});

const isGreaterThanOrEqual = (min, msg) => ({
  fInternal: false,
  id: 'isGreaterThanOrEqual',
  validate: val => (
    val >= min
      ? undefined
      : buildError(msg, `must be greater than or equal to ${min}`, val, { min })
  ),
});
const isGte = isGreaterThanOrEqual;

const isLowerThanOrEqual = (max, msg) => ({
  fInternal: false,
  id: 'isLowerThanOrEqual',
  validate: val => (
    val <= max
      ? undefined
      : buildError(msg, `must be lower than or equal to ${max}`, val, { max })
  ),
});
const isLte = isLowerThanOrEqual;

const isWithinRange = (min, max, msg) => ({
  fInternal: false,
  id: 'isWithinRange',
  validate: val => (
    val >= min && val <= max
      ? undefined
      : buildError(msg, `must be between ${min} and ${max} (inclusive)`,
          val, { min, max })
  ),
});

// ==========================================
// Date
// ==========================================
const isDate = (msg) => ({
  fInternal: true,
  id: 'isDate',
  validate: (_val, props, context) => {
    if (props.type === 'native') return undefined;
    const { moment } = context;
    const { date, time, seconds } = props;
    const fmt = dateTimeFormat(date, time, seconds);
    if (moment(_val, fmt).isValid()) return undefined;
    const msgPart = date ? 'must be a valid date' : 'must be a valid time';
    return buildError(msg, `${msgPart}: ${fmt}`, _val, { props, fmt });
  },
});

// ==========================================
// Helpers
// ==========================================
const buildError = (msg0, defaultMsg, ...args) => {
  const msg = msg0 || defaultMsg;
  return typeof msg === 'function' ? msg(defaultMsg, ...args) : msg;
};

// ==========================================
// Public API
// ==========================================
export {
  isRequired,
  isEqualTo,
  isOneOf,

  hasAtLeastChars, hasAtMostChars,
  hasLengthWithinRange,
  isEmail, isUrl, matchesPattern,

  isNumber,
  isGreaterThanOrEqual, isGte,
  isLowerThanOrEqual, isLte,
  isWithinRange,

  isDate,
};
