import { merge }            from 'timm';
import React                from 'react';
import VirtualScroller      from './virtualScroller';
import {
  bindAll,
  simplifyString,
}                           from '../gral/helpers';
import {
  DataTableHeader,
  DataTableRow,
  DATA_TABLE_COLUMN_PROP_TYPES,
  FETCHING_MORE_ITEMS_ROW,
}                           from './dataTableRow';

const SORT_MANUALLY = '__SORT_MANUALLY__';

// ===============================================================
// Component
// ===============================================================
class DataTable extends React.PureComponent {
  static propTypes = {
    itemsById:              React.PropTypes.object,
    cols:                   React.PropTypes.arrayOf(DATA_TABLE_COLUMN_PROP_TYPES),
    lang:                   React.PropTypes.string,

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
    this.scrollbarWidth = 0;
    this.recalcMaxLabelLevel(props.cols);
    // State initialised by outer props, then free to change by default
    this.filterValue = props.filterValue;
    this.sortBy = props.sortBy;
    this.sortDescending = props.sortDescending;
    this.selectedIds = props.selectedIds;
    this.recalcShownIds(props);
    bindAll(this, [
      'onRenderLastRow',
      'onChangeScrollbarWidth',
      'onClickHeader',
    ]);
  }

  componentWillReceiveProps(nextProps) {
    const {
      itemsById,
      cols,
      shownIds,
      filterValue,
      sortBy, sortDescending,
      selectedIds,
    } = nextProps;
    let fRecalcShownIds = false;
    if (itemsById !== this.props.itemsById) fRecalcShownIds = true;
    if (cols !== this.props.cols) {
      this.recalcMaxLabelLevel(cols);
      fRecalcShownIds = true;
    }
    if (shownIds !== this.props.shownIds) fRecalcShownIds = true;
    if (filterValue !== this.props.filterValue) {
      this.filterValue = filterValue;
      fRecalcShownIds = true;
    }
    if (sortBy !== this.props.sortBy || sortDescending !== this.props.sortDescending) {
      this.sortBy = sortBy;
      this.sortDescending = sortDescending;
      fRecalcShownIds = true;
    }
    if (selectedIds !== this.props.selectedIds) this.selectedIds = selectedIds;
    if (fRecalcShownIds) this.recalcShownIds(nextProps);
  }

  recalcMaxLabelLevel(cols) {
    let maxLabelLevel = 0;
    for (let i = 0; i < cols.length; i++) {
      const labelLevel = cols[i].labelLevel;
      if (labelLevel > maxLabelLevel) maxLabelLevel = labelLevel;
    }
    this.maxLabelLevel = maxLabelLevel;
  }

  recalcShownIds(props) {
    let shownIds = props.shownIds;
    shownIds = this.filter(shownIds);
    shownIds = this.sort(shownIds);
    this.shownIds = shownIds;
  }

  // ===============================================================
  // Render
  // ===============================================================
  render() {
    const { cols, lang } = this.props;

    // Timm will make sure `this.commonRowProps` doesn't change unless
    // any of the merged properties changes.
    this.commonRowProps = merge(this.commonRowProps || {}, {
      cols,
      lang,
      selectedIds: this.props.selectedIds,
    });

    // Get the ordered list of IDs to be shown
    let shownIds = this.shownIds.slice();
    if (this.props.fetching) shownIds.push(FETCHING_MORE_ITEMS_ROW);
    return (
      <div
        className="giu-data-table"
        style={style.outer}
      >
        <DataTableHeader
          cols={cols}
          lang={lang}
          maxLabelLevel={this.maxLabelLevel}
          scrollbarWidth={this.scrollbarWidth}
          sortBy={this.sortBy}
          sortDescending={this.sortDescending}
          onClick={this.props.headerClickForSorting ? this.onClickHeader : undefined}
        />
        <VirtualScroller ref={c => { this.refVirtualScroller = c; }}
          itemsById={this.props.itemsById}
          shownIds={shownIds}
          RowComponent={DataTableRow}
          commonRowProps={this.commonRowProps}
          onRenderLastRow={this.props.fetchMoreItems ? this.onRenderLastRow : undefined}
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
    if (id === FETCHING_MORE_ITEMS_ROW) return;
    const { fetchMoreItems } = this.props;
    console.log('onRenderLastRow: ', fetchMoreItems)
    if (!fetchMoreItems) return;
    fetchMoreItems(id);
  }

  onChangeScrollbarWidth(scrollbarWidth) {
    this.scrollbarWidth = scrollbarWidth;
    this.forceUpdate();
  }

  onClickHeader(attr) {
    const { sortBy, sortDescending } = this;
    if (attr !== sortBy) {
      this.changeSort(attr, false);
    } else if (sortDescending) {
      this.changeSort(null, false);
    } else {
      const colSpec = this.props.cols.find(o => o.attr === attr);
      let fSortableDescending = colSpec ? colSpec.sortableDescending : true;
      if (fSortableDescending == null) fSortableDescending = true;
      if (fSortableDescending) {
        this.changeSort(attr, true);
      } else {
        this.changeSort(null, false);
      }
    }
  }

  changeSort(sortBy, sortDescending) {
    if (sortBy === this.sortBy && sortDescending === this.sortDescending) return;
    this.sortBy = sortBy;
    this.sortDescending = sortDescending;
    this.recalcShownIds(this.props);
    if (this.refVirtualScroller) this.refVirtualScroller.scrollToTop();
    this.forceUpdate();
    if (this.props.onChangeSort) this.props.onChangeSort({ sortBy, sortDescending });
  }

  // ===============================================================
  // Filtering and sorting
  // ===============================================================
  filter(ids) {
    let needle = this.filterValue;
    if (!needle) return ids;
    needle = simplifyString(needle);
    console.log(`Filtering for ${needle}...`);
    const { itemsById } = this.props;
    const cols = this.props.cols.filter(col => col.filterable !== false);
    const numCols = cols.length;
    const filteredIds = [];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const item = itemsById[id];
      let fInclude = false;
      for (let k = 0; k < numCols; k++) {
        const col = cols[k];
        let haystack = col.filterValue ?
          col.filterValue(item) :
          (col.rawValue ? col.rawValue(item) : item[col.attr]);
        if (!haystack.toLowerCase) continue;
        haystack = simplifyString(haystack);
        if (haystack.indexOf && haystack.indexOf(needle) >= 0) {
          console.log(`${id} included; ${haystack} includes ${needle}`);
          fInclude = true;
          break;
        }
      }
      if (fInclude) filteredIds.push(id);
    }
    return filteredIds;
  }

  sort(ids) {
    const { sortBy, sortDescending } = this;
    const { itemsById } = this.props;
    if (!sortBy) return ids;
    const col = this.props.cols.find(o => o.attr === sortBy);
    if (!col) return ids;
    const getSortValue = col.sortValue || col.rawValue || (item => item[sortBy]);
    const sortValues = {};
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      sortValues[id] = getSortValue(itemsById[id]);
    }
    const sortedIds = ids.slice();
    sortedIds.sort((idA, idB) => {
      const valueA = sortValues[idA];
      const valueB = sortValues[idB];
      let out;
      if (valueA != null && valueB != null) {
        if (valueA < valueB) {
          out = -1;
        } else if (valueA > valueB) {
          out = +1;
        }
      }
      if (out == null) out = idA < idB ? -1 : +1;
      return out;
    });
    if (sortDescending) sortedIds.reverse();
    return sortedIds;
  }
}

// ===============================================================
// Styles
// ===============================================================
const style = {
  outer: {
    maxWidth: '100%',
    overflowX: 'hidden',
  },
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
