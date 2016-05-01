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


/*
  scrollIntoView: (refItem, refScroller, options = {}) ->
    return if not refItem?
    return if refItem is @_prevRefItem
    @_prevRefItem = refItem
    itemNode = @refs[refItem]
    return if not itemNode?
    scrollerNode = @refs[refScroller]?
    return if not scrollerNode?
    scrollerLevelsUp = options.scrollerLevelsUp ? 0
    for i in [0...scrollerLevelsUp]
      scrollerNode = scrollerNode.parentNode
      return if not scrollerNode?
    itemY1 = itemNode.offsetTop - scrollerNode.offsetTop
    itemH  = itemNode.offsetHeight
    itemY2 = itemY1 + itemH
    shownY1 = scrollerNode.scrollTop
    shownH  = scrollerNode.clientHeight
    shownY2 = shownY1 + shownH
    if itemY2 > shownY2
      if itemH > shownH
        scrollerNode.scrollTop = itemY1
      else
        scrollerNode.scrollTop += (itemY2 - shownY2)
    if itemY1 < shownY1
      scrollerNode.scrollTop = itemY1
*/

function scrollIntoView(node) {
  if (!node) return;
  const bcr = node.getBoundingClientRect();
  let croppingAncestor;
  let idx = 0;
  while ((croppingAncestor = _getCroppingAncestor(bcr, node.parentNode))) {

    if (croppingAncestor === window) {

    } else {

    }

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
