import {
  getScrollbarWidth,
}                           from '../gral/constants';
import {
  windowHeightWithoutScrollbar, windowWidthWithoutScrollbar,
}                           from '../gral/helpers';

const SCROLL_INTO_VIEW_WINDOW_BREATHE = 5;

// -----------------------------------------------
// Get-cropping-ancestor algorithm (recursive)
// -----------------------------------------------

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

function _getCroppingAncestor(refBcr, ancestor, fHoriz = null) {
  if (!ancestor || !ancestor.getBoundingClientRect) {
    let fCropped = false;
    if (fHoriz == null || fHoriz === false) {
      if (refBcr.top < 0 || refBcr.bottom > windowHeightWithoutScrollbar()) fCropped = true;
    }
    if (fHoriz == null || fHoriz === true) {
      if (refBcr.left < 0 || refBcr.right > windowWidthWithoutScrollbar()) fCropped = true;
    }
    return fCropped ? window : null;
  }

  // If we reach a `Modal` ancestor, it is the same as if we'd
  // reached `window` (the `Modal` may be embedded in an
  // uncorrelated component, and the algorithm would mistakenly
  // think that the whole Modal is hidden due to the parent's BCR)
  if (ancestor.className.indexOf('giu-modal') >= 0) return null;

  const ancestorBcr = ancestor.getBoundingClientRect();
  let fCropped = false;
  let fOverflowHidden;
  if (fHoriz == null || fHoriz === false) {
    fOverflowHidden = !_isOverflowVisible(ancestor.style.overflowY);
    if (fOverflowHidden && (refBcr.top < ancestorBcr.top || refBcr.bottom > ancestorBcr.bottom)) {
      fCropped = true;
    }
  }
  if (fHoriz == null || fHoriz === true) {
    fOverflowHidden = !_isOverflowVisible(ancestor.style.overflowX);
    if (fOverflowHidden && (refBcr.left < ancestorBcr.left || refBcr.right > ancestorBcr.right)) {
      fCropped = true;
    }
  }
  return fCropped ? ancestor : _getCroppingAncestor(refBcr, ancestor.parentNode, fHoriz);
}

// -----------------------------------------------
// Scroll-into-view algorithm (iterative)
// -----------------------------------------------

// Scroll vertically, then horizontally
function scrollIntoView(node) {
  if (!node) return;
  _scrollIntoView(node, false);
  _scrollIntoView(node, true);
}

function _scrollIntoView(node, fHoriz) {
  let bcr = node.getBoundingClientRect();
  let ancestor = _getCroppingAncestor(bcr, node.parentNode, fHoriz);
  while (ancestor) {
    const fWindowLevel = ancestor === window;
    const node1 = bcr[fHoriz ? 'left' : 'top'];
    const node2 = bcr[fHoriz ? 'right' : 'bottom'];
    const nodeD = node2 - node1;
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
    const ancestorD = ancestor2 - ancestor1;

    // Align left (up) if `node` is above or larger than the cropping `ancestor`.
    // Align right (bottom) otherwise.
    let delta;
    let breathe = fWindowLevel ? SCROLL_INTO_VIEW_WINDOW_BREATHE : 0;
    if (nodeD > ancestorD) breathe = 0;
    if (node1 < ancestor1 || nodeD > ancestorD) {
      delta = node1 - ancestor1 - breathe;
    } else {
      delta = node2 - ancestor2 + breathe;
    }

    if (fWindowLevel) {
      const deltaX = fHoriz ? delta : 0;
      const deltaY = fHoriz ? 0 : delta;
      window.scrollBy(deltaX, deltaY);
    } else {
      ancestor[fHoriz ? 'scrollLeft' : 'scrollTop'] += delta;
    }

    // Update before iterating: BCR may have changed, and we may still not be visible
    bcr = node.getBoundingClientRect();
    ancestor = fWindowLevel ? null : _getCroppingAncestor(bcr, ancestor.parentNode);
  }
}

// -----------------------------------------------
// Helpers
// -----------------------------------------------
function _isOverflowVisible(overflow) {
  return (!overflow || overflow === 'visible');
}

// -----------------------------------------------
// Public API
// -----------------------------------------------
export {
  isVisible, 
  scrollIntoView,
};
