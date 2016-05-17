import {
  getScrollbarWidth,
}                           from '../gral/constants';
import ReactDOM             from 'react-dom';

function bindAll(_this, fnNames) {
  fnNames.forEach(name => {
    /* eslint-disable no-param-reassign */
    _this[name] = _this[name].bind(_this);
    /* eslint-enable no-param-reassign */
  });
}

function cancelEvent(ev) {
  if (!ev) return;
  ev.preventDefault && ev.preventDefault();
  ev.stopPropagation && ev.stopPropagation();
}

function preventDefault(ev) {
  if (!ev) return;
  ev.preventDefault && ev.preventDefault();
}

function cancelBodyScrolling(ev, el) {
  if (!el) return;
  if (ev.nativeEvent.deltaY <= 0) {
    if (el.scrollTop <= 0) cancelEvent(ev);
  } else {
    if (el.scrollTop + el.clientHeight + 0.5 >= el.scrollHeight) cancelEvent(ev);
  }
}

// -----------------------------------------------
// Widths, heights...
// -----------------------------------------------
function windowBottomScrollbarHeight() {
  let out;
  if (document.body.scrollWidth > window.innerWidth) {
    out = getScrollbarWidth();
  } else {
    out = 0;
  }
  return out;
}

function windowRightScrollbarWidth() {
  let out;
  if (document.body.scrollHeight > window.innerHeight) {
    out = getScrollbarWidth();
  } else {
    out = 0;
  }
  return out;
}

function windowHeightWithoutScrollbar() {
  return window.innerHeight - windowBottomScrollbarHeight();
}

function windowWidthWithoutScrollbar() {
  return window.innerWidth - windowRightScrollbarWidth();
}

// -----------------------------------------------
// Public API
// -----------------------------------------------
export {
  bindAll,
  cancelEvent, preventDefault,
  cancelBodyScrolling,
  windowBottomScrollbarHeight, windowRightScrollbarWidth,
  windowHeightWithoutScrollbar, windowWidthWithoutScrollbar,
};
