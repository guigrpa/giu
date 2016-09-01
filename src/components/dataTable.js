import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import throttle             from 'lodash/throttle';
import { bindAll }          from '../gral/helpers';
import 'react-virtualized/styles.css'; // only needs to be imported once

const PropTypeColumn = React.PropTypes.shape({
  attr:                     React.PropTypes.string.isRequired,

  // Label
  label:                    React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func,
  ]),
  labelLevel:               React.PropTypes.number,  // useful for very narrow cols

  // Contents
  rawValue:                 React.PropTypes.func,
  filterValue:              React.PropTypes.func,
  sortValue:                React.PropTypes.func,
  render:                   React.PropTypes.func,

  // Functionalities
  isSortable:               React.PropTypes.bool,  // true by default
  isSortableDescending:     React.PropTypes.bool,  // true by default

  // Appearance
  isHidden:                 React.PropTypes.bool,
  minWidth:                 React.PropTypes.number,
  flexGrow:                 React.PropTypes.number,
  flexShrink:               React.PropTypes.number,
});

const SORT_MANUALLY = '__SORT_MANUALLY__';

// ===============================================================
// Component
// ===============================================================
class DataTable extends React.Component {
  static propTypes = {
    itemsById:              React.PropTypes.object,
    cols:                   React.PropTypes.arrayOf(PropTypeColumn),
    idAttr:                 React.PropTypes.string,

    shownIds:               React.PropTypes.arrayOf(React.PropTypes.string),

    // Filtering
    filterValue:            React.PropTypes.string,

    // Sorting
    areHeadersClickable:    React.PropTypes.bool,
    isManuallySortable:     React.PropTypes.bool,     // dragging possible (adds dragging col)
    onChangeSort:           React.PropTypes.func,     // N/A if (!areHeadersClickable)
    sortBy:                 React.PropTypes.string,
    sortDescending:         React.PropTypes.bool,

    // Selection
    selectedIds:            React.PropTypes.arrayOf(React.PropTypes.string),
    areRowsSelectable:      React.PropTypes.bool,
    hasMultipleSelection:   React.PropTypes.bool,
    onChangeSelection:      React.PropTypes.func,
    isCopyAllowed:          React.PropTypes.bool,
    isCutAllowed:           React.PropTypes.bool,
    onCopyCut:              React.PropTypes.func,

    // Fetching
    fetchMoreItems:         React.PropTypes.func,

    // Styles
    height:                 React.PropTypes.number,
    width:                  React.PropTypes.number,
    rowHeight:              React.PropTypes.number,   // auto-calculated if unspecified

    numRowsInitialRender:   React.PropTypes.number,
    maxRowsToRender:        React.PropTypes.number,
  };

  static defaultProps = {
    itemsById:              {},
    cols:                   [],
    idAttr:                 'id',

    shownIds:               [],

    filterValue:            '',

    areHeadersClickable:    true,
    isManuallySortable:     true,
    sortBy:                 null,
    sortDescending:         false,

    selectedIds:            [],
    areRowsSelectable:      false,
    hasMultipleSelection:   false,
    isCopyAllowed:          true,
    isCutAllowed:           false,

    numRowsInitialRender:   20,
    maxRowsToRender:        1000,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.state = {
      // State initialised by outer props, then free to change by default
      shownIds: props.shownIds,
      selectedIds: props.selectedIds,
      sortBy: props.sortBy,
      sortDescending: props.sortDescending,
    };
    this.cachedHeights = {};
    this.pendingHeights = [];
    this.totalHeight = undefined;
    this.rowTops = {};
    bindAll(this, [
      'onChangeRowHeight',
      'recalcViewPort',
    ]);
    this.throttledRecalcViewPort = throttle(this.recalcViewPort, 200);
  }

  componentDidMount() {
    this.recalcViewPort();
    window.addEventListener('resize', this.throttledRecalcViewPort);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.throttledRecalcViewPort);
  }

  componentDidUpdate() {
    this.recalcViewPort();
  }

  recalcViewPort() {
    if (!this.refBody) return;
    const { scrollTop, clientHeight } = this.refBody;
    // console.log(`scrollTop=${scrollTop}, clientHeight=${clientHeight}`)
    if (
      scrollTop !== this.scrollTop ||
      clientHeight !== this.clientHeight
    ) {
      this.scrollTop = scrollTop;
      this.clientHeight = clientHeight;
      this.scrollBottom = scrollTop + clientHeight; // convenience
      this.forceUpdate();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { shownIds, sortBy, sortDescending, selectedIds } = nextProps;
    if (shownIds !== this.props.shownIds) this.setState({ shownIds });
    if (selectedIds !== this.props.selectedIds) this.setState({ selectedIds });
    if (sortBy !== this.props.sortBy) this.setState({ sortBy });
    if (sortDescending !== this.props.sortDescending) this.setState({ sortDescending });
  }

  // ===============================================================
  // Render
  // ===============================================================
  render() {
    console.log(`Rendering data table [top=${this.scrollTop}, bottom=${this.scrollBottom}]...`);
    const idsToRender = this.getIdsToRender();
    console.log(`idsToRender: ${idsToRender}`);
    return (
      <div>
        {/* TODO: Header */}
        <div ref={c => { this.refBody = c; }}
          onScroll={this.recalcViewPort}
          style={style.body(this.props)}
        >
          {this.renderSizer()}
          {idsToRender.map(this.renderRow, this)}
        </div>
      </div>
    );
  }

  renderSizer() {
    console.log(`totalHeight: ${this.totalHeight}`)
    return <div style={style.sizer(this.totalHeight)}></div>;
  }

  renderRow(id) {
    const item = this.props.itemsById[id];
    if (!this.cachedHeights[id]) this.pendingHeights.push(id);
    return (
      <VerticalManager key={id}
        id={id}
        top={this.rowTops[id]}
        onChangeHeight={this.onChangeRowHeight}
      >
        <DataTableRow id={id} item={item} />
      </VerticalManager>
    );
  }

  // ===============================================================
  // Event handlers
  // ===============================================================
  onChangeRowHeight(id, height) {
    console.log('New height', id, height)
    if (this.cachedHeights[id] == null) {
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
  getIdsToRender() {
    const { shownIds } = this.state;
    const { maxRowsToRender } = this.props;
    const { scrollTop, scrollBottom, minHeight = 1 } = this;
    const numRows = shownIds.length;
    let out;

    // We have no idea at all (probably during the first render)...
    if (scrollTop == null) {
      const { height, rowHeight } = this.props;
      let numRowsToRender = height != null && rowHeight != null ?
        Math.ceil(height / rowHeight + 1) :
        this.props.numRowsInitialRender;
      if (numRowsToRender > maxRowsToRender) numRowsToRender = maxRowsToRender;
      out = shownIds.slice(0, numRowsToRender);

    // We know where the scroller is
    } else {
      // Look for the first row that either:
      // - has no rowTop
      // - is partially visible
      let idxFirst;
      const { rowTops } = this;
      let fFirstRowIsCached = false;
      let rowTopFirst = 0;
      for (idxFirst = 1; idxFirst < numRows; idxFirst++) {
        const rowTop = rowTops[shownIds[idxFirst]];
        if (rowTop == null) break;
        if (rowTop >= scrollTop) {
          fFirstRowIsCached = true;
          break;
        }
        rowTopFirst = rowTop;
      }
      idxFirst--;
      if (fFirstRowIsCached) {
        // Look for the first row after `idxFirst` that either:
        // - has no rowTop
        // - is partially visible
        let fLastRowIsCached = false;
        let idxLast;
        let rowTopLast;
        for (idxLast = idxFirst; idxLast < numRows; idxLast++) {
          rowTopLast = rowTops[shownIds[idxLast]];
          if (rowTopLast == null) break;
          if (rowTopLast > scrollBottom) {
            fLastRowIsCached = true;
            break;
          }
        }
        if (fLastRowIsCached) {
          out = shownIds.slice(idxFirst, idxLast);
        } else {
          let numRowsToRender = Math.ceil((scrollBottom - rowTopLast) / minHeight + 1);
          if (numRowsToRender > maxRowsToRender) numRowsToRender = maxRowsToRender;
          out = shownIds.slice(idxFirst, idxLast + numRowsToRender);
        }
      } else {
        let numRowsToRender = Math.ceil((scrollBottom - rowTopFirst) / minHeight + 1);
        if (numRowsToRender > maxRowsToRender) numRowsToRender = maxRowsToRender;
        out = shownIds.slice(idxFirst, idxFirst + numRowsToRender);
      }
    }
    return out;
  }

  recalcTops() {
    const { shownIds } = this.state;
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
    if (i === numRows) {
      this.totalHeight = top;
    } else {
      const numPending = numRows - i;
      const avgHeight = top / i;
      this.totalHeight = top + numPending * avgHeight;
    }
  }
}

// ===============================================================
// Styles
// ===============================================================
const style = {
  outer: {},
  body: ({ height, width }) => ({
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
  handle: {
    marginRight: 10,
    cursor: 'pointer',
  },
};


// ===============================================================
// VerticalManager
// ===============================================================
// Renders hidden first, reports on its height, then becomes visible when
// it gets a `top` property passed from the top. Becoming visible does not
// mean its child component gets re-rendered (this is more efficient than
// react-virtualized when using its CellMeasurer component).
class VerticalManager extends React.Component {
  static propTypes = {
    id:                     React.PropTypes.string.isRequired,
    children:               React.PropTypes.any,
    onChangeHeight:         React.PropTypes.func.isRequired,
    top:                    React.PropTypes.number,
  }

  constructor(props) {
    super(props);
    bindAll(this, [
      'measure',
    ]);
    this.measure = throttle(this.measure.bind(this), 200);
  }

  componentDidMount() {
    this.measure();
    window.addEventListener('resize', this.measure);
  }

  componentDidUpdate() { this.measure(); }

  componentWillUnmount() { window.removeEventListener('resize', this.measure); }

  measure() {
    const container = this.refs.container;
    if (!container) return;
    const height = container.clientHeight;
    if (height !== this.height) {
      this.height = height;
      this.props.onChangeHeight(this.props.id, height);
    }
  }

  render() {
    return (
      <div ref="container" style={styleY(this.props)}>
        {this.props.children}
      </div>
    );
  }
}

const styleY = ({ top }) => ({
  position: 'absolute',
  opacity: top != null ? 1 : 0,
  top,
  left: 0,
  right: 0,
});

// ===============================================================
// Row
// ===============================================================
const DEBUG_HEIGHTS = [20, 40, 25, 36, 15, 80];

class DataTableRow extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const { id, item } = this.props;
    console.log(`Rendering row ${id}...`);
    return <div style={{height: DEBUG_HEIGHTS[parseInt(id) % 6]}}>{item.id} - {item.name}</div>;
  }
}


// ===============================================================
// Helper components
// ===============================================================
// const DragHandle = sortableHandle(() => <span style={style.handle}>***</span>)
// const dragRenderer = () => <DragHandle />;
//
// const SortableFlexTable = sortableContainer(FlexTable, { withRef: true });
// const SortableRow = sortableElement(defaultFlexTableRowRenderer);
//
// const descRenderer = ({ item }) => <span>{item.name}</span>;
//
// const rendererForSizeMeasurement = item => descRenderer({ item });

// ===============================================================
// Public API
// ===============================================================
export default DataTable;
export {
  SORT_MANUALLY,
};
