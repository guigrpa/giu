import React                from 'react';
import VirtualScroller      from './virtualScroller';

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
class DataTable extends React.PureComponent {
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

    areHeadersClickable:    true,
    isManuallySortable:     true,
    sortBy:                 null,
    sortDescending:         false,

    selectedIds:            [],
    areRowsSelectable:      false,
    hasMultipleSelection:   false,
    isCopyAllowed:          true,
    isCutAllowed:           false,
  };

  constructor(props) {
    super(props);
    this.state = {
      // State initialised by outer props, then free to change by default
      shownIds: props.shownIds,
      selectedIds: props.selectedIds,
      sortBy: props.sortBy,
      sortDescending: props.sortDescending,
    };
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
    return (
      <div>
        {/* TODO: Header */}
        <VirtualScroller
          itemsById={this.props.itemsById}
          shownIds={this.state.shownIds}
          RowComponent={DataTableRow}
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
// Row
// ===============================================================
const DEBUG_HEIGHTS = [20, 40, 25, 36, 15, 23];
// const DEBUG_HEIGHTS = [25];

class DataTableRow extends React.PureComponent {
  static propTypes = {
    id:                     React.PropTypes.string.isRequired,
    item:                   React.PropTypes.object.isRequired,
    onChangeHeight:         React.PropTypes.func,
  };

  componentDidUpdate() {
    const { onChangeHeight } = this.props;
    console.log(`Row ${this.props.id} didUpdate`)
    if (onChangeHeight) onChangeHeight();
  }

  render() {
    const { id, item } = this.props;
    console.log(`Rendering row ${id}...`);
    return (
      <div style={styleRow.outer(this.props)}>
        {item.id} - {item.name}
      </div>
    );
  }
}

// ===============================================================
// Styles
// ===============================================================
const styleRow = {
  outer: ({ id }) => ({
    minHeight: DEBUG_HEIGHTS[parseInt(id, 10) % DEBUG_HEIGHTS.length],
  }),
};


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
