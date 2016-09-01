import React                from 'react';
import ReactDOM             from 'react-dom';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import {
  AutoSizer,
  CellMeasurer,
  FlexTable, FlexColumn, defaultFlexTableRowRenderer,
}                           from 'react-virtualized';
import {
  SortableContainer as sortableContainer,
  SortableElement as sortableElement,
  SortableHandle as sortableHandle,
  arrayMove,
}                           from 'react-sortable-hoc';
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
    hasUniformRowHeight:    React.PropTypes.bool,
    rowHeight:              React.PropTypes.number,
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

    hasUniformHeight:       false,
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
    bindAll(this, [
      'onDragEnd',
    ]);
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
    console.log('Rendering data table...')
    const { shownIds } = this.state;
    return (
      <div style={style.outer}>
        <AutoSizer>
          {({ height, width }) => (
            <CellMeasurer
              cellRenderer={({ rowIndex }) => rendererForSizeMeasurement(this.getRow(rowIndex))}
              cellSizeCache={this}
              columnCount={1}
              rowCount={shownIds.length}
              width={width}
            >
              {({ getRowHeight }) => (
                <SortableFlexTable
                  ref={c => { this.refSortableTable = c; }}
                  getContainer={(wrappedInstance) => ReactDOM.findDOMNode(wrappedInstance.Grid)}
                  onSortEnd={this.onDragEnd}
                  width={width}
                  height={height}
                  headerHeight={30}
                  rowCount={shownIds.length}
                  rowHeight={getRowHeight}
                  rowGetter={({ index }) => this.getRow(index)}
                  rowRenderer={props => <SortableRow {...props} />}
                >
                  {this.renderCols()}
                </SortableFlexTable>
              )}
            </CellMeasurer>
          )}
        </AutoSizer>
      </div>
    );
  }

  getRow(index) { return this.props.itemsById[this.state.shownIds[index]]; }

  renderCols() {
    return this.props.cols.map(col => {
      const { attr, minWidth, flexGrow, flexShrink } = col;
      return (
        <FlexColumn
          key={attr}
          label={attr}
          dataKey={attr}
          width={minWidth || 50}
          flexGrow={flexGrow}
          flexShrink={flexShrink}
        />
      );
    });
  }

  // ===============================================================
  // Event handlers
  // ===============================================================
  onDragEnd() {}

  // ===============================================================
  // Height cache -- we implement it right in the component so that we can use
  // row ID as the key instead of the index. This way, re-sorting rows does not
  // require re-rendering to recalculate heights
  // ===============================================================
  clearAllColumnWidths() {}
  clearAllRowHeights() {
    console.log('clearAllRowHeights()');
    this.cachedHeights = {};
  }
  clearColumnWidth(index) {}
  clearRowHeight(index) {
    console.log(`clearRowHeight(${index})`);
    const id = this.state.shownIds[index];
    this.cachedHeights[id] = undefined;
  }
  getColumnWidth (index) { return undefined; }
  getRowHeight (index) {
    // console.log(`getRowHeight(${index})`);
    const id = this.state.shownIds[index];
    return this.cachedHeights[id];
  }
  hasColumnWidth (index) { return false; }
  hasRowHeight (index) {
    // console.log(`hasRowHeight(${index})`);
    const id = this.state.shownIds[index];
    return this.cachedHeights[id] >= 0;
  }
  setColumnWidth (index, width) {}
  setRowHeight (index, height) {
    // console.log(`setRowHeight(${index}, ${height})`);
    const id = this.state.shownIds[index];
    this.cachedHeights[id] = height;
  }
}

// ===============================================================
// Helper components
// ===============================================================
const DragHandle = sortableHandle(() => <span style={style.handle}>***</span>)
const dragRenderer = () => <DragHandle />;

const SortableFlexTable = sortableContainer(FlexTable, { withRef: true });
const SortableRow = sortableElement(defaultFlexTableRowRenderer);

const descRenderer = ({ item }) => <span>{item.name}</span>;

const rendererForSizeMeasurement = item => descRenderer({ item });

// ===============================================================
// Styles
// ===============================================================
const style = {
  outer: {
    width: 500,
    height: 400,
    backgroundColor: 'lavender',
  },
  handle: {
    marginRight: 10,
    cursor: 'pointer',
  },
};

// ===============================================================
// Public API
// ===============================================================
export default DataTable;
export {
  SORT_MANUALLY,
};
