const COLORS = {
  // Text
  dim: '#999999',
  darkText: 'black',
  lightText: 'white',

  // Others
  line: '#999999',
  lineDim: '#cccccc',
  darkLine: 'black',
  bgInput: 'white',
  accent: '#6600cc',

  // Notifications and errors
  notifs: {
    info: 'white',
    success: '#51a351',
    warn: '#f89406',
    error: '#bd362f',
  },
};

const KEYS = {
  backspace: 8,
  tab: 9,
  return: 13,
  enter: 13,
  esc: 27,
  space: 32,
  pageUp: 33,
  pageDown: 34,
  end: 35,
  home: 36,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  del: 46,
};

// For more: http://www.fileformat.info/info/unicode/char/search.html
const UNICODE = {
  shiftKey: '\u21E7',
  cmdKey: '\u2318',
  ctrlKey: '\u2303',
  altKey: '\u2325',
  leftArrow: '\u2190',
  upArrow: '\u2191',
  rightArrow: '\u2192',
  downArrow: '\u2193',
  returnKey: '\u23CE',
  backspaceKey: '\u232B',
  nbsp: '\u00A0',
  ellipsis: '\u2026',
  heart: '\u2764\uFE0F',
};

const MISC = {
  windowBorderBreathe: 5,
  zHintBase: 50,
  zModalBase: 50,
  zModalStep: 10,
  zMainFloatDelta: 5,
  zErrorFloatDelta: 2,
  zNotif: 9000,
};

const NULL_STRING = '__NULL__';

// ==========================================
// Scrollbar width
// ==========================================
let scrollbarWidth = null;
function updateScrollbarWidth() {
  const scrollDiv = document.createElement('div');
  scrollDiv.className = 'scrollbarMeasure';
  scrollDiv.style.position = 'fixed';
  scrollDiv.style.top = '0px';
  scrollDiv.style.left = '0px';
  scrollDiv.style.width = '100px';
  scrollDiv.style.height = '100px';
  scrollDiv.style.overflow = 'scroll';
  scrollDiv.style.opacity = '0.001';
  document.body.appendChild(scrollDiv);
  scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
}
function getScrollbarWidth() {
  if (scrollbarWidth == null) updateScrollbarWidth();
  return scrollbarWidth;
}

try {
  window.addEventListener('resize', updateScrollbarWidth);
} catch (err) { /* ignore */ }

// ==========================================
// Public API
// ==========================================
export {
  COLORS, KEYS, UNICODE, MISC,
  NULL_STRING,
  getScrollbarWidth,
};
