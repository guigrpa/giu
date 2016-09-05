import React                from 'react';
import VirtualScroller      from './virtualScroller';
import { bindAll }          from '../gral/helpers';
import {
  DataTableHeader,
  DataTableRow,
  DATA_TABLE_COLUMN_PROP_TYPES,
  FOOTER_ROW,
}                           from './dataTableRow';

const SORT_MANUALLY = '__SORT_MANUALLY__';

// ===============================================================
// Component
// ===============================================================
class DataTable extends React.PureComponent {
  static propTypes = {
    itemsById:              React.PropTypes.object,
    cols:                   React.PropTypes.arrayOf(DATA_TABLE_COLUMN_PROP_TYPES),
    idAttr:                 React.PropTypes.string,

    shownIds:               React.PropTypes.arrayOf(React.PropTypes.string),

    // Filtering
    filterValue:            React.PropTypes.string,

    // Sorting
    headerClickForSorting:  React.PropTypes.bool,
    allowManualSorting:     React.PropTypes.bool,     // dragging possible (adds dragging col)
    onChangeSort:           React.PropTypes.func,     // N/A if (!headerClickForSorting)
    sortBy:                 React.PropTypes.string,
    sortDescending:         React.PropTypes.bool,

    // Selection
    selectedIds:            React.PropTypes.arrayOf(React.PropTypes.string),
    allowSelect:            React.PropTypes.bool,
    multipleSelection:      React.PropTypes.bool,
    onChangeSelection:      React.PropTypes.func,
    allowCopy:              React.PropTypes.bool,
    allowCut:               React.PropTypes.bool,
    onCopyCut:              React.PropTypes.func,

    // Fetching
    fetchMoreItems:         React.PropTypes.func,
    fetching:               React.PropTypes.bool,

    // Styles
    height:                 React.PropTypes.number,
    width:                  React.PropTypes.number,
    rowHeight:              React.PropTypes.number,   // auto-calculated if unspecified
    uniformRowHeight:       React.PropTypes.bool,

    // For VirtualScroller specifically
    estimatedMinRowHeight:  React.PropTypes.number,
    numRowsInitialRender:   React.PropTypes.number,
    maxRowsToRenderInOneGo: React.PropTypes.number,
  };

  static defaultProps = {
    itemsById:              {},
    cols:                   [],
    idAttr:                 'id',

    shownIds:               [],

    filterValue:            '',

    headerClickForSorting:  true,
    allowManualSorting:     true,
    sortBy:                 null,
    sortDescending:         false,

    selectedIds:            [],
    allowSelect:            false,
    multipleSelection:      false,
    isCopyAllowed:          true,
    isCutAllowed:           false,

    fetching:               false,
  };

  constructor(props) {
    super(props);
    this.state = {
      scrollbarWidth: 0,
      // State initialised by outer props, then free to change by default
      shownIds: props.shownIds,
      selectedIds: props.selectedIds,
      sortBy: props.sortBy,
      sortDescending: props.sortDescending,
    };
    bindAll(this, [
      'onRenderLastRow',
      'onChangeScrollbarWidth',
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
    const { cols } = this.props;
    const commonRowProps = {
      cols,
      selectedIds: this.props.selectedIds,
    };
    const shownIds = this.props.fetching ?
      this.state.shownIds.concat(FOOTER_ROW) : this.state.shownIds;
    return (
      <div className="giu-data-table">
        <DataTableHeader
          cols={cols}
          scrollbarWidth={this.state.scrollbarWidth}
        />
        <VirtualScroller
          itemsById={this.props.itemsById}
          shownIds={shownIds}
          RowComponent={DataTableRow}
          commonRowProps={commonRowProps}
          onRenderLastRow={this.onRenderLastRow}
          onChangeScrollbarWidth={this.onChangeScrollbarWidth}
          height={this.props.height}
          width={this.props.width}
          rowHeight={this.props.rowHeight}
          uniformRowHeight={this.props.uniformRowHeight}
          estimatedMinRowHeight={this.props.estimatedMinRowHeight}
          numRowsInitialRender={this.props.numRowsInitialRender}
          maxRowsToRenderInOneGo={this.props.maxRowsToRenderInOneGo}
        />
      </div>
    );
  }

  // ===============================================================
  // Event handlers
  // ===============================================================
  onRenderLastRow(id) {
    if (id === FOOTER_ROW) return;
    const { fetchMoreItems } = this.props;
    if (!fetchMoreItems) return;
    fetchMoreItems(id);
  }

  onChangeScrollbarWidth(scrollbarWidth) {
    this.setState({ scrollbarWidth });
  }
}

// ===============================================================
// Styles
// ===============================================================
// const style = {
//   handle: {
//     marginRight: 10,
//     cursor: 'pointer',
//   },
// };

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
