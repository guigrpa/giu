// @flow

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

const FONTS = {
  mdl: '"Roboto", "Helvetica", "Arial", sans-serif',
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
  zMainFloatDelta: 5,
  zErrorFloatDelta: 2,
};

const NULL_STRING = '__NULL__';

// ==========================================
// Scrollbar width
// ==========================================
/* --
**getScrollbarWidth()**

Measures and returns the scrollbar width.

Measurements are taken lazily when first requested.
On window `resize`, it is measured again (zooming causes
the reported widths to change, and the `resize` event is a
reliable way to detect zooming).
Note that the returned value might be zero,
e.g. on OS X with overlaid scrollbars.

* **Returns** *?number*: scrollbar width in pixels
-- */
let scrollbarWidth: number;
function updateScrollbarWidth() {
  // May be SSR, hence try
  try {
    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'scrollbarMeasure';
    scrollDiv.style.position = 'fixed';
    scrollDiv.style.top = '0px';
    scrollDiv.style.left = '0px';
    scrollDiv.style.width = '100px';
    scrollDiv.style.height = '100px';
    scrollDiv.style.overflow = 'scroll';
    scrollDiv.style.opacity = '0.001';
    const { body } = document;
    if (body == null) throw new Error('document.body not present');
    body.appendChild(scrollDiv);
    scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    body.removeChild(scrollDiv);
  } catch (err) {
    scrollbarWidth = 0;
  }
}
function getScrollbarWidth(): number {
  if (scrollbarWidth == null) updateScrollbarWidth();
  return scrollbarWidth;
}

try {
  window.addEventListener('resize', updateScrollbarWidth);
} catch (err) {
  /* ignore */
}

// ==========================================
// Platform detection
// ==========================================
/* eslint-disable import/no-mutable-exports */
let IS_MAC = false;
let IS_IOS = false;
let IS_MOBILE_OR_TABLET = false;
// May be SSR, hence try
try {
  IS_MAC = /Mac/.test(navigator.platform);
  IS_IOS = /iPod|iPhone|iPad/.test(navigator.platform);
  const a = navigator.userAgent || navigator.vendor || window.opera;
  /* eslint-disable no-useless-escape */
  IS_MOBILE_OR_TABLET =
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
      a
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      a.substr(0, 4)
    );
  /* eslint-enable no-useless-escape */
} catch (err) {
  /* ignore */
}
/* eslint-enable import/no-mutable-exports */

// ==========================================
// Public
// ==========================================
export {
  COLORS,
  KEYS,
  UNICODE,
  MISC,
  FONTS,
  NULL_STRING,
  getScrollbarWidth,
  IS_MAC,
  IS_IOS,
  IS_MOBILE_OR_TABLET,
};
