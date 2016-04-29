import {
  getScrollbarWidth
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
  if (document.body.scrollWidth > window.innerWidth) {
    return getScrollbarWidth();
  } else {
    return 0;
  }
}

function windowRightScrollbarWidth() {
  if (document.body.scrollHeight > window.innerHeight) {
    return getScrollbarWidth();
  } else {
    return 0;
  }
}

export {
  bindAll,
  cancelEvent,
  windowBottomScrollbarHeight,
  windowRightScrollbarWidth,
};
