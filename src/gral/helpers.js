import {
  getScrollbarWidth,
}                           from '../gral/constants';

function bindAll(_this, fnNames) {
  for (const name of fnNames) {
    /* eslint-disable no-param-reassign */
    _this[name] = _this[name].bind(_this);
    /* eslint-enable no-param-reassign */
  }
}

function cancelEvent(ev) {
  ev.preventDefault();
  ev.stopPropagation();
}

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

export {
  bindAll,
  cancelEvent,
  windowBottomScrollbarHeight,
  windowRightScrollbarWidth,
};
