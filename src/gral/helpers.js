import {
  getScrollbarWidth,
}                           from '../gral/constants';
import ReactDOM             from 'react-dom';

// -- **bindAll()**
// --
// -- Binds a list of object methods to the object with `Function.prototype.bind()`.
// -- Especially useful for React components with ES6 syntax.
// --
// -- * **_this** *object*: methods will be bound to this object
// -- * **fnNames** *array<string>*: list of method names
function bindAll(_this, fnNames) {
  fnNames.forEach(name => {
    /* eslint-disable no-param-reassign */
    _this[name] = _this[name].bind(_this);
    /* eslint-enable no-param-reassign */
  });
}

// -- **cancelEvent()**
// --
// -- Calls `preventDefault()` and `stopPropagation()` on the provided event.
// --
// -- * **ev** *object?*: event to be cancelled
function cancelEvent(ev) {
  if (!ev) return;
  ev.preventDefault && ev.preventDefault();
  ev.stopPropagation && ev.stopPropagation();
}

// -- **preventDefault()**
// --
// -- Calls `preventDefault()` on the provided event.
// --
// -- * **ev** *object?*: event for which default behaviour is to be prevented
function preventDefault(ev) {
  if (!ev) return;
  ev.preventDefault && ev.preventDefault();
}

// -- **cancelBodyScrolling()**
// --
// -- `onWheel` event handler that can be installed on a scroller DOM node,
// -- in order to prevent `wheel` events to cause document scrolling when
// -- the scroller reaches the top/bottom of its contents.
// --
// -- * **ev** *object*: `wheel` event object
function cancelBodyScrolling(ev) {
  const el = ev.currentTarget;
  if (ev.nativeEvent.deltaY <= 0) {
    if (el.scrollTop <= 0) cancelEvent(ev);
  } else {
    if (el.scrollTop + el.clientHeight + 0.5 >= el.scrollHeight) cancelEvent(ev);
  }
}

// ==========================================
// Widths, heights...
// ==========================================
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

// -- **windowHeightWithoutScrollbar()/windowWidthWithoutScrollbar()**
// --
// -- Provides the inner height (width) of the window without
// -- any scrollbars that may currently be displayed.
// --
// -- * **Returns** *number*: inner height (width) in pixels
function windowHeightWithoutScrollbar() {
  return window.innerHeight - windowBottomScrollbarHeight();
}

function windowWidthWithoutScrollbar() {
  return window.innerWidth - windowRightScrollbarWidth();
}

// ==========================================
// Public API
// ==========================================
export {
  bindAll,
  cancelEvent, preventDefault,
  cancelBodyScrolling,
  windowBottomScrollbarHeight, windowRightScrollbarWidth,
  windowHeightWithoutScrollbar, windowWidthWithoutScrollbar,
};
