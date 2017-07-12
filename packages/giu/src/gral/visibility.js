// @flow

/* eslint-disable no-underscore-dangle */
import { set as timmSet } from 'timm';
import {
  windowHeightWithoutScrollbar,
  windowWidthWithoutScrollbar,
} from '../gral/helpers';
import { MISC } from '../gral/constants';

export type ScrollIntoViewOptions = {
  fHoriz?: ?boolean,
  topAncestor?: ?Node,
};

// ==========================================
// Get-cropping-ancestor algorithm (recursive)
// ==========================================

/* --
**isVisible()**

Determines whether the provided node is *fully* visible
in the browser window.

* **node** *?Node*: DOM node; if unspecified, the function returns `false`
* **bcr?** *ClientRect*: bounding client rectangle for `node`; if not specified,
  `getBoundingClientRect()` will be called on `node`
* **Returns** *boolean*
-- */
function isVisible(node: ?Node, bcr0?: ClientRect): boolean {
  if (!node) return false;
  if (!(node instanceof Element)) return true;
  const bcr = bcr0 || node.getBoundingClientRect();
  const croppingAncestor = _getCroppingAncestor(bcr, node.parentNode);
  return !croppingAncestor;
}

function _getCroppingAncestor(
  refBcr: ClientRect,
  ancestor: ?Node,
  options?: ScrollIntoViewOptions = {}
): ?Node {
  const { fHoriz, topAncestor } = options;
  if (!ancestor || !(ancestor instanceof HTMLElement)) {
    let fCropped = false;
    if (fHoriz == null || fHoriz === false) {
      if (refBcr.top < 0 || refBcr.bottom > windowHeightWithoutScrollbar()) {
        fCropped = true;
      }
    }
    if (fHoriz == null || fHoriz === true) {
      if (refBcr.left < 0 || refBcr.right > windowWidthWithoutScrollbar()) {
        fCropped = true;
      }
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
    if (
      fOverflowHidden &&
      (refBcr.top < ancestorBcr.top || refBcr.bottom > ancestorBcr.bottom)
    ) {
      fCropped = true;
    }
  }
  if (fHoriz == null || fHoriz === true) {
    fOverflowHidden = !_isOverflowVisible(ancestor.style.overflowX);
    if (
      fOverflowHidden &&
      (refBcr.left < ancestorBcr.left || refBcr.right > ancestorBcr.right)
    ) {
      fCropped = true;
    }
  }
  if (fCropped) return ancestor;
  if (ancestor === topAncestor) return null;
  return _getCroppingAncestor(refBcr, ancestor.parentNode, options);
}

// ==========================================
// Scroll-into-view algorithm (iterative)
// ==========================================

/* --
**scrollIntoView()**

Scrolls the node's ancestors as needed in order to make a node fully visible
in the browser window (or at least most of it, if it is too large).
Implemented as a recursive algorithm that is first run
vertically and then horizontally.

* **node** *?Node*: DOM node
* **options?** *object = {}*: the following options are allowed:
  - **topAncestor?** *?Node*: stop the recursive algorithm at this
    ancestor (otherwise stops at the root level or when a `Modal`
    ancestor is reached)
-- */
function scrollIntoView(node: ?Node, options?: ?ScrollIntoViewOptions = {}) {
  if (!node) return;
  if (!(node instanceof Element)) return;
  _scrollIntoView(node, timmSet(options, 'fHoriz', false));
  _scrollIntoView(node, timmSet(options, 'fHoriz', true));
}

function _scrollIntoView(node: Element, options: ScrollIntoViewOptions) {
  let bcr = node.getBoundingClientRect();
  const { fHoriz, topAncestor } = options;
  let ancestor: ?Object = _getCroppingAncestor(bcr, node.parentNode, options);
  while (ancestor) {
    const fWindowLevel = ancestor === window;
    const node1 = fHoriz ? bcr.left : bcr.top;
    const node2 = fHoriz ? bcr.right : bcr.bottom;
    const nodeD = node2 - node1;
    let ancestor1;
    let ancestor2;
    if (fWindowLevel) {
      ancestor1 = 0;
      ancestor2 = fHoriz
        ? windowWidthWithoutScrollbar()
        : windowHeightWithoutScrollbar();
    } else {
      const bcr2 = ancestor.getBoundingClientRect();
      ancestor1 = fHoriz ? bcr2.left : bcr2.top;
      ancestor2 = fHoriz ? bcr2.right : bcr2.bottom;
    }
    const ancestorD = ancestor2 - ancestor1;

    // Align left (up) if `node` is above or larger than the cropping `ancestor`.
    // Align right (bottom) otherwise.
    let delta;
    let breathe = fWindowLevel ? MISC.windowBorderBreathe : 0;
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
      /* eslint-disable no-lonely-if */
      if (fHoriz) {
        ancestor.scrollLeft += delta;
      } else {
        ancestor.scrollTop += delta;
      }
      /* eslint-enable no-lonely-if */
    }

    // Update before iterating: BCR may have changed, and we may still not be visible
    bcr = node.getBoundingClientRect();
    if (fWindowLevel) break;
    if (ancestor === topAncestor) break;
    ancestor = _getCroppingAncestor(bcr, ancestor.parentNode, options);
  }
}

// ==========================================
// Helpers
// ==========================================
function _isOverflowVisible(overflow) {
  return !overflow || overflow === 'visible';
}

// ==========================================
// Public API
// ==========================================
export { isVisible, scrollIntoView };
