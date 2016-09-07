import {
  set as timmSet,
  removeAt, addLast,
}                           from 'timm';
import React                from 'react';
import {
  SortableContainer as sortableContainer,
  SortableElement as sortableElement,
  SortableHandle as sortableHandle,
  arrayMove,
}                           from 'react-sortable-hoc';
import VirtualScroller      from './virtualScroller';
const SortableVirtualScroller = sortableContainer(VirtualScroller);
import { COLORS }           from '../gral/constants';
import { isDark }           from '../gral/styles';
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
import Icon                 from './icon';

const SORT_MANUALLY = '__SORT_MANUALLY__';
const createManualSortCol = label => ({
  attr: SORT_MANUALLY,
  sortable: true,
  sortableDescending: false,
  filterable: false,
  label,
  labelLevel: 1,
  /* eslint-disable react/prop-types */
  render: ({ fSortedManually }) => <DragHandle disabled={!fSortedManually} />,
  /* eslint-enable react/prop-types */
  minWidth: 30,
  flexGrow: 0,
  flexShrink: 0,
});

const DragHandle = sortableHandle(({ disabled }) =>
  <Icon icon="bars" disabled={disabled} style={style.dragHandle} />
);

// ===============================================================
// Component
// ===============================================================
class DataTable extends React.PureComponent {
  static propTypes = {
    itemsById:              React.PropTypes.object,
    cols:                   React.PropTypes.arrayOf(DATA_TABLE_COLUMN_PROP_TYPES),
    lang:                   React.PropTypes.string,

    shownIds:               React.PropTypes.arrayOf(React.PropTypes.string),
    alwaysRenderIds:        React.PropTypes.arrayOf(React.PropTypes.string),

    // Filtering
    filterValue:            React.PropTypes.string,

    // Sorting
    headerClickForSorting:  React.PropTypes.bool,
    allowManualSorting:     React.PropTypes.bool,     // dragging possible (adds dragging col)
    manualSortColLabel:     React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.func,
    ]),
    onChangeSort:           React.PropTypes.func,     // N/A if (!headerClickForSorting)
    sortBy:                 React.PropTypes.string,
    sortDescending:         React.PropTypes.bool,

    // Selection
    selectedIds:            React.PropTypes.arrayOf(React.PropTypes.string),
    allowSelect:            React.PropTypes.bool,
    multipleSelection:      React.PropTypes.bool,
    onChangeSelection:      React.PropTypes.func,
    onClipboardAction:      React.PropTypes.func,

    // Fetching
    fetchMoreItems:         React.PropTypes.func,
    fetching:               React.PropTypes.bool,

    // Styles
    height:                 React.PropTypes.number,
    width:                  React.PropTypes.number,
    rowHeight:              React.PropTypes.number,   // auto-calculated if unspecified
    uniformRowHeight:       React.PropTypes.bool,
    accentColor:            React.PropTypes.string,

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
    manualSortColLabel:     'Sort manually',
    sortBy:                 null,
    sortDescending:         false,

    selectedIds:            [],
    allowSelect:            false,
    multipleSelection:      false,

    fetching:               false,

    accentColor:            COLORS.accent,
  };

  constructor(props) {
    super(props);
    this.scrollbarWidth = 0;
    this.recalcCols(props);
    this.recalcMaxLabelLevel();
    // State initialised by outer props, then free to change by default
    this.filterValue = props.filterValue;
    this.sortBy = props.sortBy;
    this.sortDescending = props.sortDescending;
    this.selectedIds = props.selectedIds;
    this.recalcShownIds(props);
    this.recalcColors(props);
    bindAll(this, [
      'onRenderLastRow',
      'onChangeScrollbarWidth',
      'onClickHeader',
      'onClickRow',
      'onDragEnd',
    ]);
    this.commonRowProps = {};
  }

  componentWillReceiveProps(nextProps) {
    const {
      itemsById,
      cols,
      shownIds,
      filterValue,
      sortBy, sortDescending,
      selectedIds,
      accentColor,
    } = nextProps;
    let fRecalcShownIds = false;
    if (itemsById !== this.props.itemsById) fRecalcShownIds = true;
    if (cols !== this.props.cols) {
      this.recalcCols(nextProps);
      this.recalcMaxLabelLevel();
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
    if (fRecalcShownIds) this.recalcShownIds(nextProps);
    if (selectedIds !== this.props.selectedIds) this.selectedIds = selectedIds;
    if (accentColor !== this.props.accentColor) this.recalcColors(nextProps);
  }

  recalcCols(props) {
    if (props.allowManualSorting) {
      this.cols = [createManualSortCol(props.manualSortColLabel), ...props.cols];
    } else {
      this.cols = props.cols;
    }
  }

  recalcMaxLabelLevel() {
    const { cols } = this;
    let maxLabelLevel = 0;
    for (let i = 0; i < cols.length; i++) {
      const labelLevel = cols[i].labelLevel;
      if (labelLevel > maxLabelLevel) maxLabelLevel = labelLevel;
    }
    this.maxLabelLevel = maxLabelLevel;
  }

  recalcColors(props) {
    const { accentColor } = props;
    this.selectedBgColor = accentColor;
    this.selectedFgColor = COLORS[isDark(accentColor) ? 'lightText' : 'darkText'];
  }

  recalcShownIds(props) {
    let { shownIds } = props;
    shownIds = this.filter(shownIds, props);
    shownIds = this.sort(shownIds, props);
    this.shownIds = shownIds;
  }

  // ===============================================================
  // Render
  // ===============================================================
  render() {
    const { lang, filterValue } = this.props;
    const { cols, selectedIds, sortBy, sortDescending } = this;

    const fSortedManually = sortBy === SORT_MANUALLY;

    // Timm will make sure `this.commonRowProps` doesn't change unless
    // any of the merged properties changes.
    let commonRowProps = this.commonRowProps;
    commonRowProps = timmSet(commonRowProps, 'cols', cols);
    commonRowProps = timmSet(commonRowProps, 'lang', lang);
    commonRowProps = timmSet(commonRowProps, 'fSortedManually', fSortedManually);
    commonRowProps = timmSet(commonRowProps, 'selectedIds', selectedIds);
    commonRowProps = timmSet(commonRowProps, 'selectedBgColor', this.selectedBgColor);
    commonRowProps = timmSet(commonRowProps, 'selectedFgColor', this.selectedFgColor);
    commonRowProps = timmSet(commonRowProps, 'onClick',
      this.props.allowSelect ? this.onClickRow : undefined);
    this.commonRowProps = commonRowProps;

    // Get the ordered list of IDs to be shown
    let shownIds = this.shownIds.slice();
    if (this.props.fetching) shownIds.push(FETCHING_MORE_ITEMS_ROW);
    const ChosenVirtualScroller = fSortedManually ? SortableVirtualScroller : VirtualScroller;
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
          sortBy={sortBy}
          sortDescending={sortDescending}
          onClick={this.props.headerClickForSorting ? this.onClickHeader : undefined}
        />
        <ChosenVirtualScroller ref={c => { this.refVirtualScroller = c; }}
          itemsById={this.props.itemsById}
          shownIds={shownIds}
          alwaysRenderIds={this.props.alwaysRenderIds}
          RowComponent={fSortedManually ? sortableElement(DataTableRow) : DataTableRow}
          commonRowProps={commonRowProps}
          onRenderLastRow={filterValue ? undefined : this.onRenderLastRow}
          onChangeScrollbarWidth={this.onChangeScrollbarWidth}
          height={this.props.height}
          width={this.props.width}
          rowHeight={this.props.rowHeight}
          uniformRowHeight={this.props.uniformRowHeight}
          estimatedMinRowHeight={this.props.estimatedMinRowHeight}
          numRowsInitialRender={this.props.numRowsInitialRender}
          maxRowsToRenderInOneGo={this.props.maxRowsToRenderInOneGo}
          // Sortable
          useDragHandle={fSortedManually ? true : undefined}
          onSortEnd={fSortedManually ? this.onDragEnd : undefined}
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
      const colSpec = this.cols.find(o => o.attr === attr);
      let fSortableDescending = colSpec ? colSpec.sortableDescending : true;
      if (fSortableDescending == null) fSortableDescending = true;
      if (fSortableDescending) {
        this.changeSort(attr, true);
      } else {
        this.changeSort(null, false);
      }
    }
  }

  onClickRow(ev, id) {
    const prevSelectedIds = this.selectedIds;
    const fShift = ev.shiftKey && this.props.multipleSelection;
    if (fShift) {
      const idx = this.selectedIds.indexOf(id);
      if (idx >= 0) {
        this.selectedIds = removeAt(this.selectedIds, idx);
      } else {
        this.selectedIds = addLast(this.selectedIds, id);
      }
    } else {
      if (prevSelectedIds.length === 1 && prevSelectedIds[0] === id) return;
      this.selectedIds = [id];
    }
    this.forceUpdate();
    if (this.props.onChangeSelection) this.props.onChangeSelection(this.selectedIds);
  }

  changeSort(sortBy, sortDescending) {
    if (sortBy === this.sortBy && sortDescending === this.sortDescending) return;
    this.sortBy = sortBy;
    this.sortDescending = sortDescending;
    this.recalcShownIds(this.props);
    if (this.refVirtualScroller) this.refVirtualScroller.scrollToTop();
    this.forceUpdate();
    if (this.props.onChangeSort) {
      this.props.onChangeSort({ sortBy, sortDescending, shownIds: this.shownIds });
    }
  }

  onDragEnd({ oldIndex, newIndex }) {
    console.log(`DataTable: moved #${oldIndex} to #${newIndex}`);
    this.shownIds = this.shownIds.slice();
    arrayMove(this.shownIds, oldIndex, newIndex);
    this.props.onChangeSort({
      sortBy: this.sortBy,
      sortDescending: this.sortDescending,
      shownIds: this.shownIds,
    });
    this.forceUpdate();
  }

  // ===============================================================
  // Filtering and sorting
  // ===============================================================
  filter(ids, props) {
    let needle = this.filterValue;
    if (!needle) return ids;
    needle = simplifyString(needle);
    const { itemsById } = props;
    const cols = this.cols.filter(col => col.filterable !== false);
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
          fInclude = true;
          break;
        }
      }
      if (fInclude) filteredIds.push(id);
    }
    return filteredIds;
  }

  // TODO: handle manual sort!
  sort(ids, props) {
    const { sortBy, sortDescending } = this;
    const { itemsById } = props;
    if (!sortBy) return ids;
    const col = this.cols.find(o => o.attr === sortBy);
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
  dragHandle: {
    marginLeft: 4,
    marginRight: 3,
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
