import { merge }            from 'timm';
import React                from 'react';
import throttle             from 'lodash/throttle';
import { bindAll }          from '../gral/helpers';
import VerticalManager      from './verticalManager';

const MAX_ROWS_INITIAL_RENDER = 20;

// ===============================================================
// Component
// ===============================================================
class VirtualScroller extends React.PureComponent {
  static propTypes = {
    itemsById:              React.PropTypes.object,
    shownIds:               React.PropTypes.arrayOf(React.PropTypes.string),
    RowComponent:           React.PropTypes.any.isRequired,
    commonRowProps:         React.PropTypes.any,

    height:                 React.PropTypes.number,
    width:                  React.PropTypes.number,
    rowHeight:              React.PropTypes.number,   // auto-calculated if unspecified
    uniformRowHeight:       React.PropTypes.bool,

    // Related to calculating the number of rows to render in a batch
    numRowsInitialRender:   React.PropTypes.number,
    estimatedMinRowHeight:  React.PropTypes.number,
    maxRowsToRenderInOneGo: React.PropTypes.number,
  };

  static defaultProps = {
    itemsById:              {},
    shownIds:               [],

    uniformRowHeight:       false,

    estimatedMinRowHeight:  12,
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

    // Auxiliary attributes
    this.minHeight = props.estimatedMinRowHeight;
    this.avgHeight = undefined;

    bindAll(this, [
      'onChangeRowHeight',
      'recalcViewport',
    ]);
    this.throttledRecalcViewport = throttle(this.recalcViewport, 200);
  }

  componentDidMount() {
    this.recalcViewport();  // initial viewport measurement
    window.addEventListener('resize', this.throttledRecalcViewport);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.throttledRecalcViewport);
  }

  componentDidUpdate() {
    this.recalcViewport();
  }

  recalcViewport() {
    if (!this.refScroller) return;
    const { scrollTop, clientHeight } = this.refScroller;
    if (scrollTop !== this.scrollTop || clientHeight !== this.clientHeight) {
      this.scrollTop = scrollTop;
      this.clientHeight = clientHeight;
      this.scrollBottom = scrollTop + clientHeight; // convenience
      const { idxFirst, idxLast } = this;
      this.determineRenderInterval();
      if (this.idxFirst !== idxFirst || this.idxLast !== idxLast) {
        this.forceUpdate();
      }
    }
  }

  // ===============================================================
  // Render
  // ===============================================================
  render() {
    // console.log(`Rendering virtual scroller [top=${this.scrollTop}, ` +
    //   `bottom=${this.scrollBottom}]...`);
    return (
      <div ref={c => { this.refScroller = c; }}
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
    // console.log(`totalHeight: ${totalHeight}`);
    return <div style={style.sizer(totalHeight)}></div>;
  }

  renderRows() {
    this.determineRenderInterval();
    const { idxFirst, idxLast } = this;
    // console.log(`idxFirst: ${idxFirst}, idxLast: ${idxLast}`);
    if (idxFirst == null || idxLast == null) return null;
    const { shownIds } = this.props;
    const numVisibleRows = idxLast - idxFirst + 1;
    const rows = new Array(numVisibleRows);
    for (let i = 0; i < numVisibleRows; i++) {
      const idx = idxFirst + i;
      rows[i] = this.renderRow(idx, shownIds[idx]);
    }
    return rows;
  }

  renderRow(idx, id) {
    const { itemsById, RowComponent, commonRowProps } = this.props;
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
    return (
      <VerticalManager key={id}
        id={id}
        ChildComponent={RowComponent}
        childProps={childProps}
        top={top}
        rowHeight={rowHeight}
        onChangeHeight={onChangeHeight}
      >
        <RowComponent id={id} item={item} />
      </VerticalManager>
    );
  }

  // ===============================================================
  // Event handlers
  // ===============================================================
  onChangeRowHeight(id, height) {
    const prevCachedHeight = this.cachedHeights[id];
    if (prevCachedHeight === height) return;
    // console.log('New height', id, height);
    if (this.props.uniformRowHeight && this.rowHeight == null) {
      this.rowHeight = height;
      this.pendingHeights = [];
      this.forceUpdate();
      return;
    }
    if (prevCachedHeight == null) {
      this.pendingHeights = this.pendingHeights.filter(o => o !== id);
    }
    this.cachedHeights[id] = height;
    if (!this.pendingHeights.length) {
      this.recalcTops();
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
    // - has no rowTop (and hence *must* be rendered)
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
      // - is totally invisible
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
    let numRowsToRender = Math.ceil(diffHeight / minHeight + 1);
    if (numRowsToRender > 100) {
      numRowsToRender = Math.ceil(diffHeight / avgHeight + 1);
    }
    return Math.min(numRowsToRender, limit);
  }

  trimAndSetRenderInterval(idxFirst, idxLast) {
    const numRows = this.props.shownIds.length;
    this.idxFirst = idxFirst != null ? Math.max(idxFirst, 0) : undefined;
    this.idxLast = idxLast != null ? Math.min(idxLast, numRows - 1) : undefined;
  }

  recalcTops() {
    // console.log('Recalculating tops...')
    const { shownIds } = this.props;
    let top = 0;
    const numRows = shownIds.length;
    let i;
    let minHeight = Infinity;
    for (i = 0; i < numRows; i++) {
      const id = shownIds[i];
      this.rowTops[id] = top;
      const height = this.cachedHeights[id];
      if (height == null) break;
      if (height > 0 && height < minHeight) minHeight = height;
      top += height;
    }
    this.minHeight = minHeight;
    this.avgHeight = top / i;
    if (i === numRows) {
      this.totalHeight = top;
    } else {
      const numPending = numRows - i;
      this.totalHeight = top + numPending * this.avgHeight;
    }
  }
}

// ===============================================================
// Styles
// ===============================================================
const style = {
  scroller: ({ height, width }) => ({
    position: 'relative',
    backgroundColor: 'aliceblue',
    height, width,
    overflow: 'auto',
  }),
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
