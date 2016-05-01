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

function _getCroppingAncestor(refBcr, ancestor) {
  if (!ancestor || !ancestor.getBoundingClientRect) {
    return (refBcr.top < 0 || refBcr.bottom > windowHeightWithoutScrollbar() ||
            refBcr.left < 0 || refBcr.right > windowWidthWithoutScrollbar())
      ? window : null;
  }

  // If we reach a `Modal` ancestor, it is the same as if we'd
  // reached `window` (the `Modal` may be embedded in an
  // uncorrelated component, and the algorithm would mistakenly
  // think that the whole Modal is hidden due to the parent's BCR)
  if (ancestor.className.indexOf('giu-modal') >= 0) return null;

  const ancestorBcr = ancestor.getBoundingClientRect();
  if (refBcr.top < ancestorBcr.top ||
      refBcr.bottom > ancestorBcr.bottom ||
      refBcr.left < ancestorBcr.left ||
      refBcr.right > ancestorBcr.right) {
    return ancestor;
  }
  return _getCroppingAncestor(refBcr, ancestor.parentNode);
}

// Returns `true` if it is *fully* visible
function isVisible(node, bcr0) {
  if (!node) return false;
  const bcr = bcr0 || node.getBoundingClientRect();
  const croppingAncestor = _getCroppingAncestor(bcr, node.parentNode);
  return !croppingAncestor;
}

function getCroppingAncestor(node) {
  if (!node) return false;
  const bcr = node.getBoundingClientRect();
  return _getCroppingAncestor(bcr, node.parentNode);
}

function _scrollIntoView(node, fHoriz) {
  const bcr = node.getBoundingClientRect();
  const ancestor = _getCroppingAncestor(bcr, node.parentNode);
  if (!ancestor) return false;
  const fWindowLevel = ancestor === window;
  const node1 = bcr[fHoriz ? 'left' : 'top'];
  const node2 = bcr[fHoriz ? 'right' : 'bottom'];
  let ancestor1;
  let ancestor2;
  if (fWindowLevel) {
    ancestor1 = 0;
    ancestor2 = fHoriz ? windowWidthWithoutScrollbar() : windowHeightWithoutScrollbar();
  } else {
    const bcr2 = ancestor.getBoundingClientRect();
    ancestor1 = bcr2[fHoriz ? 'left' : 'top'];
    ancestor2 = bcr2[fHoriz ? 'right' : 'bottom'];
  }

  // Align left (up) if `node` is above or larger than the cropping `ancestor`.
  // Align right (bottom) otherwise.
  let delta;
  if (node2 - node1 > ancestor2 - ancestor1 || node1 < ancestor1) {
    delta = node1 - ancestor1;
  } else {
    delta = node2 - ancestor2;
  }

  if (fWindowLevel) {
    const deltaX = fHoriz ? delta : 0;
    const deltaY = fHoriz ? 0 : delta;
    window.scrollBy(deltaX, deltaY);
  } else {
    ancestor[fHoriz ? 'scrollLeft' : 'scrollTop'] += delta;
  }
  return true;
}

function scrollIntoView(node) {
  if (!node) return;
  let idx = 0;
  while (true) {
    // Scroll vertically
    if (!_scrollIntoView(node, false)) return;
    // Scroll horizontally
    if (!_scrollIntoView(node, true)) return;
    // Avoid infinite loops!
    if (idx++ > 100) break;
  }
}

export {
  bindAll,
  cancelEvent,
  windowBottomScrollbarHeight, windowRightScrollbarWidth,
  windowHeightWithoutScrollbar, windowWidthWithoutScrollbar,
  isVisible, getCroppingAncestor,
  scrollIntoView,
};
