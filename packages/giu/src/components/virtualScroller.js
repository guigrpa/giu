// @flow

/* eslint-disable no-console */
import { merge } from 'timm';
import React from 'react';
import type { ComponentType } from 'react';
import throttle from 'lodash/throttle';
import { cancelBodyScrolling } from '../gral/helpers';
import { getScrollbarWidth } from '../gral/constants';
import { scrollIntoView } from '../gral/visibility';
import type { ScrollIntoViewOptions } from '../gral/visibility';
import { floatReposition } from './floats';
import VerticalManager from './verticalManager';
import LargeMessage from './largeMessage';

const MAX_ROWS_INITIAL_RENDER = 20;
const CHECK_SCROLLBAR_PERIOD = 400;

const EXTRA_RENDER_PIXELS = 150;

const DEFAULT_ROW = '__DEFAULT_ROW__';

const DEBUG = false && process.env.NODE_ENV !== 'production';

// ===============================================================
// Component
// ===============================================================
type PublicProps = {
  itemsById?: Object,
  shownIds?: Array<string>,
  alwaysRenderIds?: Array<string>,
  RowComponents: { [key: string]: ComponentType<*> },
  commonRowProps: Object,
  getSpecificRowProps: (id: string) => Object,

  height: number,
  width?: number,
  rowHeight?: number, // auto-calculated if unspecified
  uniformRowHeight?: boolean,

  onRenderLastRow?: (lastRowId: string) => any,
  onChangeScrollbarWidth?: (scrollbarWidth: number) => any,

  // Related to calculating the number of rows to render in a batch
  numRowsInitialRender?: number,
  estimatedMinRowHeight?: number,
  maxRowsToRenderInOneGo?: number,

  emptyIndicator?: any,
};

type DefaultProps = {
  itemsById: Object,
  shownIds: Array<string>,
  alwaysRenderIds: Array<string>,
  uniformRowHeight: boolean,
  estimatedMinRowHeight: number,
  maxRowsToRenderInOneGo: number,
};

type Props = {
  ...$Exact<PublicProps>,
  ...$Exact<DefaultProps>,
};

class VirtualScroller extends React.PureComponent<Props> {
  rowHeight: ?number;
  idxFirst: ?number;
  idxLast: ?number;
  reportedLastRowRendered: ?number;
  rowTops: { [key: string]: number };
  cachedHeights: { [key: string]: number };
  totalHeight: ?number;
  pendingHeights: Array<string>;
  pendingScrollToId: ?string;
  pendingScrollToIdOptions: ?ScrollIntoViewOptions;
  minHeight: number;
  avgHeight: ?number;
  scrollTop: number;
  scrollBottom: number;
  clientHeight: number;
  fHasScrollbar: boolean;
  scrollbarWidth: number;
  timerCheckScrollbar: ?IntervalID;
  throttledRecalcViewport: (ev: Object) => any;
  refItems: { [key: string]: ?Object };

  static defaultProps: DefaultProps = {
    itemsById: {},
    shownIds: ([]: Array<string>),
    alwaysRenderIds: ([]: Array<string>),

    uniformRowHeight: false,

    estimatedMinRowHeight: Infinity,
    maxRowsToRenderInOneGo: 1000,
  };
  refScroller: any = React.createRef();

  constructor(props: Props) {
    super(props);

    // If the row height is specified (and hence uniform), important optimisations apply.
    // If it is uniform but unknown, the following value will become defined upon measurement.
    this.rowHeight = props.rowHeight;

    // The range of visible rows is initially unknown,
    // as are the vertical positions of each row
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
    this.throttledRecalcViewport = throttle(this.recalcViewport, 200);
  }

  componentDidMount() {
    if (this.props.height >= 0) {
      window.addEventListener('resize', this.throttledRecalcViewport);
      this.recalcViewport(); // initial viewport measurement
      this.checkRenderLastRow();
    }
    this.timerCheckScrollbar = setInterval(
      this.checkScrollbar,
      CHECK_SCROLLBAR_PERIOD
    );
  }

  componentWillUnmount() {
    if (this.props.height >= 0) {
      window.removeEventListener('resize', this.throttledRecalcViewport);
    }
    if (this.timerCheckScrollbar != null) {
      clearInterval(this.timerCheckScrollbar);
    }
  }

  componentDidUpdate() {
    if (this.props.height >= 0) {
      this.recalcViewport();
      this.checkRenderLastRow();
    }
    if (this.pendingScrollToId != null) {
      const fSucceeded = this.doScrollToId(
        this.pendingScrollToId,
        this.pendingScrollToIdOptions
      );
      if (fSucceeded) this.initPendingScroll();
    }
  }

  onScroll = (ev: Event) => {
    floatReposition();
    this.recalcViewport(ev);
  };

  recalcViewport = (ev: Object = {}) => {
    if (this.props.height < 0) return;
    if (!this.refScroller.current) return;
    const { scrollTop, clientHeight } = this.refScroller.current;
    if (scrollTop !== this.scrollTop || clientHeight !== this.clientHeight) {
      this.scrollTop = scrollTop;
      this.clientHeight = Math.max(clientHeight, 0);
      this.scrollBottom = scrollTop + clientHeight; // convenience
      const { idxFirst, idxLast } = this;
      this.determineRenderInterval();
      if (this.idxFirst !== idxFirst || this.idxLast !== idxLast) {
        /* eslint-disable max-len */
        DEBUG &&
          console.log(
            `VirtualScroller: recalcViewPort(${ev.type}): ` +
              'trigger re-render (due to scroll, resize, etc)...'
          );
        /* eslint-enable max-len */
        this.forceUpdate();
      }
    }
  };

  checkScrollbar = () => {
    if (!this.refScroller.current) return;
    const { scrollHeight, clientHeight } = this.refScroller.current;
    const { onChangeScrollbarWidth } = this.props;
    const fHasScrollbar = scrollHeight > clientHeight;
    const scrollbarWidth = fHasScrollbar ? getScrollbarWidth() : 0;
    if (fHasScrollbar !== this.fHasScrollbar) {
      this.fHasScrollbar = fHasScrollbar;
      // If a scrollbar has appeared, trigger a `resize` event on the window;
      // this will make all Textareas to resize if needed and all VerticalManagers
      // to measure themselves again (they may have become taller due to the scrollbar)
      if (fHasScrollbar) {
        DEBUG &&
          console.log(
            'VirtualScroller: scrollbar has been added: ' +
              'broadcasting resize event (may trigger re-render)...'
          );
        window.dispatchEvent(new Event('resize'));
      }
      if (onChangeScrollbarWidth) onChangeScrollbarWidth(scrollbarWidth);

      // Scroll bar width may change as a result of user zoom in/out
    } else if (scrollbarWidth !== this.scrollbarWidth) {
      DEBUG &&
        console.log(
          'VirtualScroller: scrollbar width changed: ' +
            `${this.scrollbarWidth} -> ${scrollbarWidth}. Re-rendering...`
        );
      if (onChangeScrollbarWidth) onChangeScrollbarWidth(scrollbarWidth);
    }
    this.scrollbarWidth = scrollbarWidth;
  };

  checkRenderLastRow() {
    const { onRenderLastRow, shownIds } = this.props;
    if (!onRenderLastRow) return;
    const numRows = shownIds.length;
    if (!numRows) return;
    if (
      this.idxLast != null &&
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
    if (this.refScroller.current) this.refScroller.current.scrollTop = 0;
    this.initPendingScroll();
    this.recalcViewport();
  }

  scrollPageUpDown(sign: number) {
    const { refScroller } = this;
    if (refScroller.current == null) return;
    const delta = sign * Math.max(this.clientHeight - 15, 0);
    // $FlowFixMe
    refScroller.current.scrollTop += delta;
    this.initPendingScroll();
    this.recalcViewport();
  }

  scrollIntoView(id: string, options: ?ScrollIntoViewOptions) {
    if (id == null) return;
    if (!this.doScrollToId(id, options)) {
      const idx = this.props.shownIds.indexOf(id);
      if (idx < 0) {
        DEBUG &&
          console.log(
            'VirtualScroller: scrollIntoView: ignored, id not in shownIds'
          );
        return;
      }
      this.pendingScrollToId = id;
      this.pendingScrollToIdOptions = options;
      DEBUG && console.log('VirtualScroller: scrollIntoView: re-rendering...');
      this.forceUpdate();
    }
  }

  doScrollToId(id: string, options: ?ScrollIntoViewOptions) {
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
  render() {
    this.recalcTops();
    this.determineRenderInterval();
    DEBUG &&
      console.log(
        'VirtualScroller: RENDERING ' +
          `[top=${this.scrollTop}, bottom=${this.scrollBottom}, ` +
          // $FlowFixMe
          `idxFirst=${this.idxFirst}, idxLast=${this.idxLast}]...`
      );
    return (
      <div
        ref={this.refScroller}
        className="giu-virtual-scroller"
        onWheel={this.props.height >= 0 ? cancelBodyScrolling : undefined}
        onScroll={this.onScroll}
        style={style.scroller(this.props)}
      >
        {this.renderSizer()}
        {this.renderRows()}
      </div>
    );
  }

  // Empty div with the estimated total dimensions, so that the
  // scrollbar aproximates the real size. The estimation will get better and
  // better, as more rows get rendered
  renderSizer() {
    if (this.props.height < 0) return null;
    const totalHeight =
      this.rowHeight != null
        ? this.rowHeight * this.props.shownIds.length
        : this.totalHeight;
    // DEBUG && console.log(`VirtualScroller: totalHeight: ${totalHeight}`);
    return (
      <div
        className="giu-virtual-scroller-sizer"
        style={style.sizer(totalHeight)}
      />
    );
  }

  renderRows() {
    // Server-side rendering: render no rows
    if (typeof window === 'undefined') return null;

    // Render visible rows
    const { idxFirst, idxLast } = this;
    if (idxFirst == null || idxLast == null) return this.renderEmpty();
    const { shownIds } = this.props;
    const numVisibleRows = idxLast - idxFirst + 1;
    this.pendingHeights = [];
    let rows: Array<*> = new Array(numVisibleRows);
    for (let i = 0; i < numVisibleRows; i++) {
      const idx = idxFirst + i;
      const id = shownIds[idx];
      rows[i] = this.renderRow(idx, id);
    }

    // Render rows in alwaysRenderIds that have not already been rendered
    const { alwaysRenderIds } = this.props;
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
        } else continue; // already rendered
        targetArray && targetArray.push(this.renderRow(idx, id));
      }
      rows = before.concat(rows, after);
    }
    return rows;
  }

  renderRow(idx: number, id: string) {
    // DEBUG && console.log(`VirtualScroller: rendering row ${id} (idx: ${idx})`);
    const { itemsById, commonRowProps, getSpecificRowProps } = this.props;
    const { rowHeight } = this;
    const item = itemsById[id];

    // Calculate vertical positioning props
    let top;
    let onChangeHeight;
    let staticPositioning = false;
    if (this.props.height >= 0) {
      if (rowHeight != null) {
        top = idx * rowHeight;
      } else {
        top = this.rowTops[id];
        onChangeHeight = this.onChangeRowHeight;
        if (!this.cachedHeights[id]) this.pendingHeights.push(id);
      }
    } else {
      staticPositioning = true;
    }

    // Prepare other props
    const childProps = merge(
      { id, item },
      commonRowProps,
      getSpecificRowProps(id)
    );
    const { RowComponents } = this.props;
    const RowComponent = RowComponents[id] || RowComponents[DEFAULT_ROW];

    return (
      <VerticalManager
        key={id}
        registerOuterRef={(c) => {
          this.refItems[id] = c;
        }}
        id={id}
        index={idx}
        ChildComponent={RowComponent}
        childProps={childProps}
        top={top}
        onChangeHeight={onChangeHeight}
        staticPositioning={staticPositioning}
      />
    );
  }

  renderEmpty() {
    const { emptyIndicator } = this.props;
    if (emptyIndicator) return emptyIndicator;
    return <LargeMessage>No items</LargeMessage>;
  }

  // ===============================================================
  onChangeRowHeight = (id: string, height: number) => {
    const prevCachedHeight = this.cachedHeights[id];
    if (prevCachedHeight === height) return;
    DEBUG &&
      console.log(
        `VirtualScroller: received new height for row ${id}: ${height}`
      );
    if (height < this.minHeight) this.minHeight = height;
    if (this.props.uniformRowHeight && this.rowHeight == null) {
      this.rowHeight = height;
      DEBUG &&
        console.log(
          'VirtualScroller: uniform row height is now known: re-rendering...'
        );
      this.forceUpdate();
      return;
    }
    if (prevCachedHeight == null) {
      this.pendingHeights = this.pendingHeights.filter((o) => o !== id);
    }
    this.cachedHeights[id] = height;
    if (!this.pendingHeights.length) {
      // console.log('VirtualScroller: onChangeRowHeight: re-rendering...');
      this.forceUpdate();
    }
  };

  // ===============================================================
  // Virtual list
  // ===============================================================
  recalcTops() {
    if (this.props.height < 0) return;
    const { shownIds } = this.props;
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

    // 1.1 All rows
    // ------------------------------------------------------------
    if (height < 0) {
      this.trimAndSetRenderInterval(0, numRows);
      return;
    }

    // 1.5. We know that rows have uniform heights, but unknown.
    // Render a single row!
    // ------------------------------------------------------------
    if (uniformRowHeight && rowHeight == null) {
      this.trimAndSetRenderInterval(0, 0);
      return;
    }

    const maxRowsToRender =
      scrollTop === 0
        ? MAX_ROWS_INITIAL_RENDER
        : this.props.maxRowsToRenderInOneGo;

    // 2. We have no idea of the viewport (in some first renders)
    // ------------------------------------------------------------
    if (scrollBottom == null) {
      const idxFirst = 0;
      const idxLast =
        this.props.numRowsInitialRender != null
          ? this.props.numRowsInitialRender
          : maxRowsToRender;
      this.trimAndSetRenderInterval(idxFirst, idxLast);
      return;
    }

    // 3. Fixed-height rows
    // ------------------------------------------------------------
    if (rowHeight != null) {
      const idxFirst = Math.floor(
        (scrollTop - EXTRA_RENDER_PIXELS) / rowHeight
      );
      const idxLast = Math.floor(
        (scrollBottom + EXTRA_RENDER_PIXELS) / rowHeight
      );
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
      if (rowTop >= scrollTop - EXTRA_RENDER_PIXELS) break;
      rowTopFirst = rowTop;
    }
    idxFirst -= 1;

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
        if (rowTop > scrollBottom + EXTRA_RENDER_PIXELS) break;
        rowTopLast = rowTop;
      }
      idxLast -= 1;
      if (fLastRowIsCached) {
        this.trimAndSetRenderInterval(idxFirst, idxLast);
        return;
      }
      const numRowsToRender = this.calcNumRowsToRender(
        scrollBottom + EXTRA_RENDER_PIXELS - rowTopLast,
        maxRowsToRender
      );
      this.trimAndSetRenderInterval(idxFirst, idxLast + numRowsToRender);
      return;
    }

    const numRowsToRender = this.calcNumRowsToRender(
      scrollBottom + EXTRA_RENDER_PIXELS - rowTopFirst,
      maxRowsToRender
    );
    this.trimAndSetRenderInterval(idxFirst, idxFirst + numRowsToRender);
  }

  calcNumRowsToRender(diffHeight0: number, limit: number) {
    const diffHeight = Math.max(0, diffHeight0);
    const { minHeight, avgHeight } = this;
    let numRowsToRender;
    if (minHeight != null && minHeight !== Infinity) {
      numRowsToRender = Math.ceil(diffHeight / minHeight + 1);
    }
    if (
      (numRowsToRender == null || numRowsToRender > 100) &&
      avgHeight != null
    ) {
      numRowsToRender = Math.ceil(diffHeight / avgHeight + 1);
    }
    if (numRowsToRender == null) numRowsToRender = limit;
    return Math.min(numRowsToRender, limit);
  }

  trimAndSetRenderInterval(idxFirst0: ?number, idxLast0: ?number) {
    if (idxFirst0 == null || idxLast0 == null) {
      this.idxFirst = undefined;
      this.idxLast = undefined;
      return;
    }

    // Trim
    const numRows = this.props.shownIds.length;
    const idxFirst: number = Math.min(Math.max(idxFirst0, 0), numRows - 1);
    const idxLast: number = Math.min(idxLast0, numRows - 1);
    this.idxFirst = idxFirst;
    this.idxLast = idxLast;

    // If a scroll is pending:
    // - If it is above the selected interval, shift it
    // - If it is below, enlarge the interval to include it;
    //   if the target row has a known `top`, shift the interval
    const { pendingScrollToId } = this;
    const pendingScrollToIdx =
      pendingScrollToId != null
        ? this.props.shownIds.indexOf(pendingScrollToId)
        : undefined;
    if (pendingScrollToIdx != null && pendingScrollToIdx >= 0) {
      const intervalLength = idxLast - idxFirst;
      if (pendingScrollToIdx < idxFirst) {
        this.idxFirst = pendingScrollToIdx;
        this.idxLast = pendingScrollToIdx + intervalLength;
      } else if (pendingScrollToIdx > idxLast) {
        this.idxLast = pendingScrollToIdx;
        // $FlowFixMe
        if (this.rowTops[pendingScrollToId] != null) {
          this.idxFirst = this.idxLast - intervalLength;
        }
      }
    }
  }
}

// ===============================================================
const style = {
  scroller: ({ height, width }) => ({
    position: height >= 0 ? 'relative' : undefined,
    height: height >= 0 ? height : undefined,
    width,
    overflowY: height >= 0 ? 'auto' : undefined,
    overflowX: 'hidden',
  }),
  sizer: (height) => ({ height: height || undefined }),
};

// ===============================================================
// Public
// ===============================================================
export default VirtualScroller;
export { DEFAULT_ROW };
