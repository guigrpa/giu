// @flow

import { merge, addDefaults } from 'timm';
import unorm from 'unorm';
import { getScrollbarWidth } from '../gral/constants';

/* --
**bindAll()**

Binds a list of object methods to the object with `Function#bind()`.
Especially useful for ES6-style React components.

* **self** *Object*: methods will be bound to this object
* **fnNames** *Array<string>*: list of method names
-- */
function bindAll(self: Object, fnNames: Array<string>) {
  fnNames.forEach(name => {
    /* eslint-disable no-param-reassign */
    self[name] = self[name].bind(self);
    /* eslint-enable no-param-reassign */
  });
}

/* --
**cancelEvent()**

Calls `preventDefault()` and `stopPropagation()` on the provided event.

* **ev** *?SyntheticEvent*: event to be cancelled
-- */
function cancelEvent(ev: ?SyntheticEvent) {
  if (!ev) return;
  ev.preventDefault && ev.preventDefault();
  ev.stopPropagation && ev.stopPropagation();
}

/* --
**preventDefault()**

Calls `preventDefault()` on the provided event.

* **ev** *?SyntheticEvent*: event for which default behaviour is to be prevented
-- */
function preventDefault(ev: ?SyntheticEvent) {
  if (!ev) return;
  ev.preventDefault && ev.preventDefault();
}

/* --
**stopPropagation()**

Calls `stopPropagation()` on the provided event.

* **ev** *?SyntheticEvent*: event for which default behaviour is to be prevented
-- */
function stopPropagation(ev: ?SyntheticEvent) {
  if (!ev) return;
  ev.stopPropagation && ev.stopPropagation();
}

/* --
**cancelBodyScrolling()**

`onWheel` event handler that can be attached to a scroller DOM node,
in order to prevent `wheel` events to cause document scrolling when
the scroller reaches the top/bottom of its contents.

* **ev** *SyntheticWheelEvent*: `wheel` event
-- */
function cancelBodyScrolling(ev: SyntheticWheelEvent) {
  const el = ev.currentTarget;
  if (!(el instanceof Element)) return;
  const { nativeEvent } = ev;
  if (!(nativeEvent instanceof WheelEvent)) return;
  if (nativeEvent.deltaY <= 0) {
    if (el.scrollTop <= 0) cancelEvent(ev);
  } else if (el.scrollTop + el.clientHeight + 0.5 >= el.scrollHeight) {
    cancelEvent(ev);
  }
  stopPropagation(ev);
}

// ==========================================
// Widths, heights...
// ==========================================
function windowBottomScrollbarHeight(): number {
  let out = 0;
  // May be SSR, hence try
  try {
    const { body } = document;
    if (body && body.scrollWidth > window.innerWidth) {
      out = getScrollbarWidth();
    }
  } catch (err) {
    /* ignore */
  }
  return out;
}

function windowRightScrollbarWidth(): number {
  let out = 0;
  // May be SSR, hence try
  try {
    const { body } = document;
    if (body && body.scrollHeight > window.innerHeight) {
      out = getScrollbarWidth();
    }
  } catch (err) {
    /* ignore */
  }
  return out;
}

/* --
**windowHeightWithoutScrollbar() / windowWidthWithoutScrollbar()**

Provides the inner height (width) of the window
excluding scrollbars (if any).

* **Returns** *number*: inner height (width) in pixels
-- */
function windowHeightWithoutScrollbar(): number {
  // May be SSR, hence try
  try {
    return window.innerHeight - windowBottomScrollbarHeight();
  } catch (err) {
    return 600;
  }
}

function windowWidthWithoutScrollbar(): number {
  // May be SSR, hence try
  try {
    return window.innerWidth - windowRightScrollbarWidth();
  } catch (err) {
    return 600;
  }
}

function propsWithDefaultsAndOverrides(
  props: Object,
  defaults: ?Object,
  overrides?: ?Object
): Object {
  return merge(addDefaults(props, defaults), overrides);
}

/* --
**simplifyString()**

Generates a new version of a string with the following changes:
all lowercase, no diacritics, Unicode-normalized (NFKD). Useful
for (simplistic) sorting and filtering. A quick'n'dirty
collation helper.

* **str** *string*: string to be processed
* **Returns** *string*: simplified version of the input string
-- */
const COMBINING_CODEPOINTS = /[\u0300-\u036F]/g;
function simplifyString(str: string): string {
  if (str == null) return str;
  return unorm
    .nfkd(str)
    .replace(COMBINING_CODEPOINTS, '')
    .toLowerCase();
}

// ==========================================
// Public API
// ==========================================
export {
  bindAll,
  cancelEvent,
  preventDefault,
  stopPropagation,
  cancelBodyScrolling,
  windowBottomScrollbarHeight,
  windowRightScrollbarWidth,
  windowHeightWithoutScrollbar,
  windowWidthWithoutScrollbar,
  propsWithDefaultsAndOverrides,
  simplifyString,

  // delay, waitUntil, isWaiting,
};
