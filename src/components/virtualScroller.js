import { merge }            from 'timm';
import React                from 'react';
import throttle             from 'lodash/throttle';
import { bindAll }          from '../gral/helpers';
import { getScrollbarWidth } from '../gral/constants';
import { scrollIntoView }   from '../gral/visibility';
import VerticalManager      from './verticalManager';

const MAX_ROWS_INITIAL_RENDER = 20;
const CHECK_SCROLLBAR_PERIOD = 400;

const DEFAULT_ROW = '__DEFAULT_ROW__';

const DEBUG = false && process.env.NODE_ENV !== 'production';

// ===============================================================
// Component
// ===============================================================
class VirtualScroller extends React.PureComponent {
  static propTypes = {
    itemsById:              React.PropTypes.object,
    shownIds:               React.PropTypes.arrayOf(React.PropTypes.string),
    alwaysRenderIds:        React.PropTypes.arrayOf(React.PropTypes.string),
    RowComponents:          React.PropTypes.object.isRequired,
    commonRowProps:         React.PropTypes.any,

    height:                 React.PropTypes.number.isRequired,
    width:                  React.PropTypes.number,
    rowHeight:              React.PropTypes.number,   // auto-calculated if unspecified
    uniformRowHeight:       React.PropTypes.bool,

    onRenderLastRow:        React.PropTypes.func,

    onChangeScrollbarWidth: React.PropTypes.func,

    // Related to calculating the number of rows to render in a batch
    numRowsInitialRender:   React.PropTypes.number,
    estimatedMinRowHeight:  React.PropTypes.number,
    maxRowsToRenderInOneGo: React.PropTypes.number,

    style:                  React.PropTypes.object,
  };

  static defaultProps = {
    itemsById:              {},
    shownIds:               [],
    alwaysRenderIds:        [],

    uniformRowHeight:       false,

    estimatedMinRowHeight:  Infinity,
    maxRowsToRenderInOneGo: 1000,
  };

  constructor(props) {
    super(props);

    // If the row height is specified (and hence uniform), important optimisations apply.
    // If it is uniform but unknown, the following value will become defined upon measurement.
    this.rowHeight = props.rowHeight;

    // The range of visible rows is initially unknown, as are the vertical positions
    // of each row
    this.idxFirst = undefined;
    this.idxLast = undefined;
    this.rowTops = {};
    this.cachedHeights = {};

    // We keep a list of IDs for which height is pending. When the list empties,
    // a `forceUpdate` is triggered. This is to minimise the number of re-renders needed
    // when a new section of the table gets scrolled to.
    this.pendingHeights = [];

    // We want to have a rough estimation of the total height in order to simulate
    // (via a 'sizer' node) that our content is this high, so that the browser's
    // scroller is correctly drawn.
    this.totalHeight = undefined;

    // List of references to VerticalManager's <div>s (to scroll to them if needed)
    this.refItems = {};

    // Auxiliary attributes
    this.minHeight = props.estimatedMinRowHeight;
    this.avgHeight = undefined;
    this.fHasScrollbar = false;
    this.scrollbarWidth = 0;

    bindAll(this, [
      'onChangeRowHeight',
      'recalcViewport',
      'checkScrollbar',
    ]);
    this.throttledRecalcViewport = throttle(this.recalcViewport, 200);
  }

  componentDidMount() {
    window.addEventListener('resize', this.throttledRecalcViewport);
    this.recalcViewport();  // initial viewport measurement
    this.checkRenderLastRow();
    this.timerCheckScrollbar = setInterval(this.checkScrollbar, CHECK_SCROLLBAR_PERIOD);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.throttledRecalcViewport);
    if (this.timerCheckScrollbar != null) clearInterval(this.timerCheckScrollbar);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.shownIds !== this.props.shownIds) {
      this.recalcTops(nextProps);
    }
  }

  componentDidUpdate() {
    this.recalcViewport();
    this.checkRenderLastRow();
    if (this.pendingScrollToId != null) {
      const fSucceeded = this.doScrollToId(this.pendingScrollToId, this.pendingScrollToIdOptions);
      if (fSucceeded) this.initPendingScroll();
    }
  }

  recalcViewport(ev = {}) {
    if (!this.refScroller) return;
    const { scrollTop, clientHeight } = this.refScroller;
    if (scrollTop !== this.scrollTop || clientHeight !== this.clientHeight) {
      this.scrollTop = scrollTop;
      this.clientHeight = clientHeight;
      this.scrollBottom = scrollTop + clientHeight; // convenience
      const { idxFirst, idxLast } = this;
      this.determineRenderInterval();
      if (this.idxFirst !== idxFirst || this.idxLast !== idxLast) {
        /* eslint-disable max-len */
        DEBUG && console.log(`VirtualScroller: recalcViewPort(${ev.type}): trigger re-render (due to scroll, resize, etc)...`);
        /* eslint-enable max-len */
        this.forceUpdate();
      }
    }
  }

  checkScrollbar() {
    if (!this.refScroller) return;
    const { scrollHeight, clientHeight } = this.refScroller;
    const { onChangeScrollbarWidth } = this.props;
    const fHasScrollbar = scrollHeight > clientHeight;
    const scrollbarWidth = fHasScrollbar ? getScrollbarWidth() : 0;
    if (fHasScrollbar !== this.fHasScrollbar) {
      this.fHasScrollbar = fHasScrollbar;
      // If a scrollbar has appeared, trigger a `resize` event on the window;
      // this will make all Textareas to resize if needed and all VerticalManagers
      // to measure themselves again (they may have become taller due to the scrollbar)
      if (fHasScrollbar) {
        DEBUG && console.log('VirtualScroller: scrollbar has been added -> broadcasting resize event ' +
          '(may trigger re-render)...');
        window.dispatchEvent(new Event('resize'));
      }
      if (onChangeScrollbarWidth) onChangeScrollbarWidth(scrollbarWidth);

    // Scroll bar width may change as a result of user zoom in/out
    } else if (scrollbarWidth !== this.scrollbarWidth) {
      DEBUG && console.log('VirtualScroller: scrollbar width changed: ' +
        `${this.scrollbarWidth} -> ${scrollbarWidth}. Re-rendering...`);
      if (onChangeScrollbarWidth) onChangeScrollbarWidth(scrollbarWidth);
    }
    this.scrollbarWidth = scrollbarWidth;
  }

  checkRenderLastRow() {
    const { onRenderLastRow, shownIds } = this.props;
    if (!onRenderLastRow) return;
    const numRows = shownIds.length;
    if (!numRows) return;
    if (
      this.idxLast === numRows - 1 &&
      this.reportedLastRowRendered !== this.idxLast
    ) {
      this.reportedLastRowRendered = this.idxLast;
      onRenderLastRow(shownIds[this.idxLast]);
    }
  }

  // ===============================================================
  // Imperative
  // ===============================================================
  scrollToTop() {
    if (this.refScroller) this.refScroller.scrollTop = 0;
    this.initPendingScroll();
    this.recalcViewport();
  }

  scrollPageUpDown(sign) {
    const { refScroller } = this;
    if (!refScroller) return;
    const delta = sign * Math.max(this.clientHeight - 15, 0);
    this.refScroller.scrollTop += delta;
    this.initPendingScroll();
    this.recalcViewport();
  }

  scrollIntoView(id, options) {
    if (id == null) return;
    if (!this.doScrollToId(id, options)) {
      const idx = this.props.shownIds.indexOf(id);
      if (idx < 0) {
        DEBUG && console.log('VirtualScroller: scrollIntoView: ignored, id not in shownIds');
        return;
      }
      this.pendingScrollToId = id;
      this.pendingScrollToIdOptions = options;
      DEBUG && console.log('VirtualScroller: scrollIntoView: re-rendering...');
      this.forceUpdate();
    }
  }

  doScrollToId(id, options) {
    // Check whether the node is correctly positioned (in case of unknown rowHeight)
    if (this.rowHeight == null) {
      const top = this.rowTops[id];
      if (top == null) return false;
    }
    const node = this.refItems[id];
    if (!node) return false;
    scrollIntoView(node, options);
    return true;
  }

  initPendingScroll() {
    this.pendingScrollToId = undefined;
    this.pendingScrollToIdOptions = undefined;
  }

  // ===============================================================
  // Render
  // ===============================================================
  render() {
    this.determineRenderInterval();
    DEBUG && console.log(`VirtualScroller: RENDERING ` +
      `[top=${this.scrollTop}, bottom=${this.scrollBottom}, ` +
      `idxFirst=${this.idxFirst}, idxLast=${this.idxLast}]...`);
    return (
      <div ref={c => { this.refScroller = c; }}
        className="giu-virtual-scroller"
        onScroll={this.recalcViewport}
        style={style.scroller(this.props)}
      >
        {this.renderSizer()}
        {this.renderRows()}
      </div>
    );
  }

  renderSizer() {
    const totalHeight = this.rowHeight != null ?
      this.rowHeight * this.props.shownIds.length :
      this.totalHeight;
    // DEBUG && console.log(`VirtualScroller: totalHeight: ${totalHeight}`);
    return <div style={style.sizer(totalHeight)}></div>;
  }

  renderRows() {
    const { idxFirst, idxLast } = this;
    if (idxFirst == null || idxLast == null) return null;
    const { shownIds, alwaysRenderIds } = this.props;
    const numVisibleRows = idxLast - idxFirst + 1;
    this.pendingHeights = [];
    let rows = new Array(numVisibleRows);
    for (let i = 0; i < numVisibleRows; i++) {
      const idx = idxFirst + i;
      const id = shownIds[idx];
      rows[i] = this.renderRow(idx, id);
    }
    if (alwaysRenderIds.length) {
      const before = [];
      const after = [];
      for (let i = 0; i < alwaysRenderIds.length; i++) {
        const id = alwaysRenderIds[i];
        const idx = shownIds.indexOf(id);
        if (idx < 0) continue;
        let targetArray;
        if (idx < idxFirst) {
          targetArray = before;
        } else if (idx > idxLast) {
          targetArray = after;
        } else continue;
        targetArray.push(this.renderRow(idx, id));
      }
      rows = before.concat(rows, after);
    }
    return rows;
  }

  renderRow(idx, id) {
    // DEBUG && console.log(`VirtualScroller: rendering row ${id} (idx: ${idx})`);
    const { itemsById, RowComponents, commonRowProps } = this.props;
    const { rowHeight } = this;
    const item = itemsById[id];
    let top;
    let onChangeHeight;
    if (rowHeight != null) {
      top = idx * rowHeight;
    } else {
      top = this.rowTops[id];
      onChangeHeight = this.onChangeRowHeight;
      if (!this.cachedHeights[id]) this.pendingHeights.push(id);
    }
    const childProps = merge({ id, item }, commonRowProps);
    const RowComponent = RowComponents[id] || RowComponents[DEFAULT_ROW];
    return (
      <VerticalManager key={id}
        registerOuterRef={c => { this.refItems[id] = c; }}
        id={id}
        index={idx}
        ChildComponent={RowComponent}
        childProps={childProps}
        top={top}
        onChangeHeight={onChangeHeight}
      />
    );
  }

  // ===============================================================
  // Event handlers
  // ===============================================================
  onChangeRowHeight(id, height) {
    const prevCachedHeight = this.cachedHeights[id];
    if (prevCachedHeight === height) return;
    DEBUG && console.log(`VirtualScroller: received new height for row ${id}: ${height}`);
    if (height < this.minHeight) this.minHeight = height;
    if (this.props.uniformRowHeight && this.rowHeight == null) {
      this.rowHeight = height;
      DEBUG && console.log('VirtualScroller: uniform row height is now known: re-rendering...');
      this.forceUpdate();
      return;
    }
    if (prevCachedHeight == null) {
      this.pendingHeights = this.pendingHeights.filter(o => o !== id);
    }
    this.cachedHeights[id] = height;
    if (!this.pendingHeights.length) {
      this.recalcTops(this.props);
      // console.log('VirtualScroller: onChangeRowHeight: re-rendering...');
      this.forceUpdate();
    }
  }

  // ===============================================================
  // Virtual list
  // ===============================================================
  determineRenderInterval() {
    const { shownIds, height, uniformRowHeight } = this.props;
    const { rowHeight, scrollTop = 0, scrollBottom = height } = this;
    const numRows = shownIds.length;

    // 1. No rows at all!
    // ------------------------------------------------------------
    if (!numRows) {
      this.trimAndSetRenderInterval(undefined, undefined);
      return;
    }

    // 1.5. We know that rows have uniform heights, but unknown.
    // Render a single row!
    // ------------------------------------------------------------
    if (uniformRowHeight && rowHeight == null) {
      this.trimAndSetRenderInterval(0, 0);
      return;
    }

    const maxRowsToRender = scrollTop === 0 ?
      MAX_ROWS_INITIAL_RENDER : this.props.maxRowsToRenderInOneGo;

    // 2. We have no idea of the viewport (in some first renders)
    // ------------------------------------------------------------
    if (scrollBottom == null) {
      const idxFirst = 0;
      const idxLast = this.props.numRowsInitialRender != null ?
        this.props.numRowsInitialRender : maxRowsToRender;
      this.trimAndSetRenderInterval(idxFirst, idxLast);
      return;
    }

    // 3. Fixed-height rows
    // ------------------------------------------------------------
    if (rowHeight != null) {
      const idxFirst = Math.floor(scrollTop / rowHeight);
      const idxLast = Math.floor(scrollBottom / rowHeight);
      this.trimAndSetRenderInterval(idxFirst, idxLast);
      return;
    }

    // 4. General case: we know the viewport
    // ------------------------------------------------------------
    const { rowTops } = this;

    // Look for `idxFirst`, first row that either:
    // - has no rowTop (and hence the previous one *must* be rendered)
    // - is partially visible
    let idxFirst;
    let fFirstRowIsCached = true;
    let rowTopFirst = 0;
    for (idxFirst = 1; idxFirst < numRows; idxFirst++) {
      const rowTop = rowTops[shownIds[idxFirst]];
      if (rowTop == null) {
        fFirstRowIsCached = false;
        break;
      }
      if (rowTop >= scrollTop) break;
      rowTopFirst = rowTop;
    }
    idxFirst--;

    if (fFirstRowIsCached) {
      // Look for `idxLast`, first row after `idxFirst` that either:
      // - has no rowTop
      // - is totally invisible (then we take the previous one)
      let fLastRowIsCached = true;
      let idxLast;
      let rowTopLast = rowTopFirst;
      for (idxLast = idxFirst + 1; idxLast < numRows; idxLast++) {
        const rowTop = rowTops[shownIds[idxLast]];
        if (rowTop == null) {
          fLastRowIsCached = false;
          break;
        }
        if (rowTop > scrollBottom) break;
        rowTopLast = rowTop;
      }
      idxLast--;
      if (fLastRowIsCached) {
        this.trimAndSetRenderInterval(idxFirst, idxLast);
        return;
      }
      const numRowsToRender = this.calcNumRowsToRender(scrollBottom - rowTopLast, maxRowsToRender);
      this.trimAndSetRenderInterval(idxFirst, idxLast + numRowsToRender);
      return;
    }

    const numRowsToRender = this.calcNumRowsToRender(scrollBottom - rowTopFirst, maxRowsToRender);
    this.trimAndSetRenderInterval(idxFirst, idxFirst + numRowsToRender);
  }

  calcNumRowsToRender(diffHeight, limit) {
    const { minHeight, avgHeight } = this;
    let numRowsToRender;
    if (minHeight != null && minHeight !== Infinity) {
      numRowsToRender = Math.ceil(diffHeight / minHeight + 1);
    }
    if ((numRowsToRender == null || numRowsToRender > 100) && avgHeight != null) {
      numRowsToRender = Math.ceil(diffHeight / avgHeight + 1);
    }
    if (numRowsToRender == null) numRowsToRender = limit;
    return Math.min(numRowsToRender, limit);
  }

  trimAndSetRenderInterval(idxFirst, idxLast) {
    if (idxFirst == null || idxLast == null) {
      this.idxFirst = this.idxLast = undefined;
      return;
    }

    // Trim
    const numRows = this.props.shownIds.length;
    this.idxFirst = Math.max(idxFirst, 0);
    this.idxLast = Math.min(idxLast, numRows - 1);

    // If a scroll is pending:
    // - If it is above the selected interval, shift it
    // - If it is below, enlarge the interval to include it;
    //   if the target row has a known `top`, shift the interval
    const { pendingScrollToId } = this;
    const pendingScrollToIdx = pendingScrollToId != null ?
      this.props.shownIds.indexOf(pendingScrollToId) : undefined;
    if (pendingScrollToIdx >= 0) {
      const intervalLength = this.idxLast - this.idxFirst;
      if (pendingScrollToIdx < this.idxFirst) {
        this.idxFirst = pendingScrollToIdx;
        this.idxLast = pendingScrollToIdx + intervalLength;
      } else if (pendingScrollToIdx > this.idxLast) {
        this.idxLast = pendingScrollToIdx;
        if (this.rowTops[pendingScrollToId] != null) {
          this.idxFirst = this.idxLast - intervalLength;
        }
      }
    }
  }

  recalcTops(props) {
    // console.log('Recalculating tops...');
    const { shownIds } = props;
    let top = 0;
    const numRows = shownIds.length;
    let i;
    this.rowTops = {};
    if (!numRows) {
      this.totalHeight = 0;
      return;
    }
    for (i = 0; i < numRows; i++) {
      const id = shownIds[i];
      this.rowTops[id] = top;
      const height = this.cachedHeights[id];
      if (height == null) break;
      top += height;
    }
    if (i > 0) {
      this.avgHeight = top / i;
      this.totalHeight = top + (numRows - i) * this.avgHeight;
    }
  }
}

// ===============================================================
// Styles
// ===============================================================
const style = {
  scroller: ({ height, width, style: baseStyle }) => merge({
    position: 'relative',
    height, width,
    overflowY: 'auto',
    overflowX: 'hidden',
  }, baseStyle),
  sizer: totalHeight => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: totalHeight != null ? totalHeight : 1,
    opacity: 0,
    zIndex: -1,
  }),
};

// ===============================================================
// Public API
// ===============================================================
export default VirtualScroller;
export {
  DEFAULT_ROW,
};
