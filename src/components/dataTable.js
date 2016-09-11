import {
  merge,
  removeAt, addLast,
}                           from 'timm';
import React                from 'react';
import {
  SortableContainer as sortableContainer,
  SortableElement as sortableElement,
  SortableHandle as sortableHandle,
  arrayMove,
}                           from 'react-sortable-hoc';
import VirtualScroller, { DEFAULT_ROW } from './virtualScroller';
import { COLORS, KEYS }     from '../gral/constants';
import { isDark }           from '../gral/styles';
import {
  bindAll,
  simplifyString,
}                           from '../gral/helpers';
import { localGet, localSet } from '../gral/storage';
import {
  DataTableHeader,
  DataTableRow,
  DataTableFetchingRow,
  DATA_TABLE_COLUMN_PROP_TYPES,
}                           from './dataTableRow';
import FocusCapture         from './focusCapture';
import Icon                 from './icon';
import './dataTable.css';

const FETCHING_MORE_ITEMS_ROW = '__FETCHING_MORE_ITEMS_ROW__';
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

const FOCUSABLE = ['input', 'textarea', 'select'];

const DragHandle = sortableHandle(({ disabled }) =>
  <Icon
    icon="bars"
    disabled={disabled}
    style={style.dragHandle}
  />
);

const SortableDataTableRow = sortableElement(DataTableRow);
const SortableVirtualScroller = sortableContainer(VirtualScroller, { withRef: true });

// ===============================================================
// Component
// ===============================================================
class DataTable extends React.PureComponent {
  static propTypes = {
    itemsById:              React.PropTypes.object,
    cols:                   React.PropTypes.arrayOf(DATA_TABLE_COLUMN_PROP_TYPES).isRequired,
    lang:                   React.PropTypes.string,

    shownIds:               React.PropTypes.arrayOf(React.PropTypes.string),
    onChangeShownIds:       React.PropTypes.func,
    alwaysRenderIds:        React.PropTypes.arrayOf(React.PropTypes.string),
    commonCellProps:        React.PropTypes.object,

    // Filtering
    filterValue:            React.PropTypes.string,

    // Sorting
    headerClickForSorting:  React.PropTypes.bool,
    onChangeSort:           React.PropTypes.func,     // N/A if (!headerClickForSorting)
    sortBy:                 React.PropTypes.string,
    sortDescending:         React.PropTypes.bool,

    // Manual sorting
    allowManualSorting:     React.PropTypes.bool,     // dragging possible (adds dragging col)
    manuallyOrderedIds:     React.PropTypes.arrayOf(React.PropTypes.string),
    onChangeManualOrder:    React.PropTypes.func,     // N/A if (!allowManualSorting)
    collectionName:         React.PropTypes.string,
    manualSortColLabel:     React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.func,
    ]),

    // Selection
    selectedIds:            React.PropTypes.arrayOf(React.PropTypes.string),
    allowSelect:            React.PropTypes.bool,
    multipleSelection:      React.PropTypes.bool,
    onChangeSelection:      React.PropTypes.func,
    onClipboardAction:      React.PropTypes.func,

    // Fetching
    fetchMoreItems:         React.PropTypes.func,
    fetching:               React.PropTypes.bool,
    FetchRowComponent:      React.PropTypes.any,

    // Styles
    height:                 React.PropTypes.number,
    width:                  React.PropTypes.number,
    rowHeight:              React.PropTypes.number,   // auto-calculated if unspecified
    uniformRowHeight:       React.PropTypes.bool,
    accentColor:            React.PropTypes.string,
    styleHeader:            React.PropTypes.object,
    styleRow:               React.PropTypes.object,

    // For VirtualScroller specifically
    estimatedMinRowHeight:  React.PropTypes.number,
    numRowsInitialRender:   React.PropTypes.number,
    maxRowsToRenderInOneGo: React.PropTypes.number,
  };

  static defaultProps = {
    itemsById:              {},
    shownIds:               [],

    filterValue:            '',

    headerClickForSorting:  true,
    sortBy:                 null,
    sortDescending:         false,

    allowManualSorting:     true,
    manualSortColLabel:     'Sort manually',

    selectedIds:            [],
    allowSelect:            true,
    multipleSelection:      true,

    fetching:               false,
    FetchRowComponent:      DataTableFetchingRow,

    height:                 200,
    accentColor:            COLORS.accent,
  };

  constructor(props) {
    super(props);
    this.scrollbarWidth = 0;
    this.fDragging = false;
    this.recalcCols(props);
    this.recalcMaxLabelLevel();
    // State initialised by outer props, then free to change by default
    this.filterValue = props.filterValue;
    this.sortBy = props.sortBy;
    this.sortDescending = props.sortDescending;
    this.selectedIds = props.selectedIds;
    if (props.manuallyOrderedIds) {
      this.manuallyOrderedIds = props.manuallyOrderedIds;
    } else if (props.collectionName) {
      this.manuallyOrderedIds = localGet(this.getLocalStorageKey(props.collectionName));
    } else {
      this.manuallyOrderedIds = undefined;
    }
    this.recalcShownIds(props);
    this.recalcRowComponents(props);
    this.recalcColors(props);
    bindAll(this, [
      'onRenderLastRow',
      'onChangeScrollbarWidth',
      'onKeyDown',
      'onClickOuter',
      'onClickHeader',
      'onClickRow',
      'onDragStart',
      'onDragEnd',
    ]);
    this.commonRowProps = {};
  }

  componentDidMount() {
    this.scrollSelectedIntoView({ topAncestor: this.refOuter });
  }

  componentWillReceiveProps(nextProps) {
    const {
      itemsById,
      cols,
      shownIds,
      filterValue,
      sortBy, sortDescending,
      allowManualSorting, manuallyOrderedIds,
      selectedIds,
      FetchRowComponent,
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
    if (manuallyOrderedIds !== this.props.manuallyOrderedIds) {
      this.manuallyOrderedIds = manuallyOrderedIds;
      if (sortBy === SORT_MANUALLY) fRecalcShownIds = true;
    }
    if (fRecalcShownIds) this.recalcShownIds(nextProps);
    if (selectedIds !== this.props.selectedIds) this.selectedIds = selectedIds;
    if (
      FetchRowComponent !== this.props.FetchRowComponent ||
      allowManualSorting !== this.props.allowManualSorting
    ) {
      this.recalcRowComponents(nextProps);
    }
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

  recalcRowComponents(props) {
    this.RowComponents = {
      [FETCHING_MORE_ITEMS_ROW]: props.FetchRowComponent,
      [DEFAULT_ROW]: props.allowManualSorting ? SortableDataTableRow : DataTableRow,
    };
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

  componentDidUpdate() {
    const { onChangeShownIds } = this.props;
    if (onChangeShownIds) {
      if (this.shownIds !== this.prevShownIds) {
        this.prevShownIds = this.shownIds;
        onChangeShownIds(this.shownIds);
      }
    }

    // TODO: if selectedIds have changed:
    // this.scrollSelectedIntoView();
  }

  // ==========================================
  // Imperative API
  // ==========================================
  focus() { this.refFocusCapture && this.refFocusCapture.focus(); }

  // ===============================================================
  // Render
  // ===============================================================
  render() {
    const { lang, filterValue, allowManualSorting } = this.props;
    const { cols, selectedIds, sortBy, sortDescending } = this;

    const fSortedManually = sortBy === SORT_MANUALLY;

    // Timm will make sure `this.commonRowProps` doesn't change unless
    // any of the merged properties changes.
    this.commonRowProps = merge(this.commonRowProps, {
      cols, lang, selectedIds,
      fSortedManually: allowManualSorting ? fSortedManually : undefined,
      commonCellProps: this.props.commonCellProps,
      onClick: this.props.allowSelect ? this.onClickRow : undefined,
      style: this.props.styleRow,
      selectedBgColor: this.selectedBgColor,
      selectedFgColor: this.selectedFgColor,
    });

    // Get the ordered list of IDs to be shown
    let shownIds = this.shownIds.slice();
    if (this.props.fetching) shownIds.push(FETCHING_MORE_ITEMS_ROW);
    const ChosenVirtualScroller = allowManualSorting ? SortableVirtualScroller : VirtualScroller;

    return (
      <div ref={c => { this.refOuter = c; }}
        className={`giu-data-table ${this.fDragging ? 'dragging' : 'not-dragging'}`}
        onKeyDown={this.onKeyDown}
        onClick={this.onClickOuter}
        style={style.outer}
      >
        <FocusCapture registerRef={c => { this.refFocusCapture = c; }} />
        <DataTableHeader
          cols={cols}
          lang={lang}
          maxLabelLevel={this.maxLabelLevel}
          scrollbarWidth={this.scrollbarWidth}
          sortBy={sortBy}
          sortDescending={sortDescending}
          onClick={this.props.headerClickForSorting ? this.onClickHeader : undefined}
          style={this.props.styleHeader}
        />
        <ChosenVirtualScroller ref={c => { this.refVirtualScroller = c; }}
          itemsById={this.props.itemsById}
          shownIds={shownIds}
          alwaysRenderIds={this.props.alwaysRenderIds}
          RowComponents={this.RowComponents}
          commonRowProps={this.commonRowProps}
          fSortedManually={fSortedManually}
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
          useDragHandle={allowManualSorting ? true : undefined}
          onSortStart={allowManualSorting ? this.onDragStart : undefined}
          onSortEnd={allowManualSorting ? this.onDragEnd : undefined}
        />
      </div>
    );
  }

  // ===============================================================
  // Event handlers
  // ===============================================================
  onKeyDown(ev) {
    switch (ev.which) {
      case KEYS.up:
        this.selectMoveDelta(-1);
        break;
      case KEYS.down:
        this.selectMoveDelta(+1);
        break;
      default: break;
    }
  }

  // Except when clicking on an embedded focusable node, refocus on this table
  onClickOuter(ev) {
    const { tagName, disabled } = ev.target;
    if (FOCUSABLE.indexOf(tagName.toLowerCase()) >= 0 && !disabled) return;
    this.focus();
  }

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
    const fMultiSelect = (ev.metaKey || ev.ctrlKey) && this.props.multipleSelection;
    if (fMultiSelect) {
      this.selectToggleSingle(id);
    } else {
      this.selectSingle(id);
    }
  }

  onDragStart() {
    this.fDragging = true;
    this.forceUpdate();
  }

  onDragEnd({ oldIndex, newIndex }) {
    // Convert indices in `shownIds` to indices in `manuallyOrderedIds`
    const { shownIds, manuallyOrderedIds } = this;
    const finalOldIndex = manuallyOrderedIds.indexOf(shownIds[oldIndex]);
    const finalNewIndex = manuallyOrderedIds.indexOf(shownIds[newIndex]);
    if (finalOldIndex < 0 || finalNewIndex < 0) return;

    // Update `manuallyOrderedIds`, creating a new array
    // console.log(`DataTable: moved #${finalOldIndex} to #${finalNewIndex}`);
    this.manuallyOrderedIds = manuallyOrderedIds.slice();
    arrayMove(this.manuallyOrderedIds, finalOldIndex, finalNewIndex);

    // Update `shownIds` so that the changes are reflected. Then report on them to the user
    // and re-render
    this.recalcShownIds(this.props);
    this.manualOrderDidChange(this.props);
    this.forceUpdate();

    // Finally, and asynchronously (to allow time for the previous re-render),
    // set `fDragging` to `false` and re-render, to enable `VerticalManager` animations again
    // (which were disabled during dragging)
    setImmediate(() => {
      this.fDragging = false;
      this.forceUpdate();
    });
  }

  // ===============================================================
  // Selection
  // ===============================================================
  selectSingle(id) {
    if (this.selectedIds.length === 1 && this.selectedIds[0] === id) return;
    this.changeSelectedIds([id]);
  }

  selectMoveDelta(delta) {
    const { shownIds, selectedIds } = this;
    const len = shownIds.length;
    if (!len) return;
    if (!selectedIds.length) {
      this.selectSingle(delta >= 0 ? shownIds[0] : shownIds[len - 1]);
      return;
    }
    const prevIdx = shownIds.indexOf(selectedIds[0]);
    if (prevIdx < 0) {
      this.selectSingle(delta >= 0 ? shownIds[0] : shownIds[len - 1]);
      return;
    }
    let nextIdx = prevIdx + delta;
    nextIdx = Math.min(Math.max(nextIdx, 0), len - 1);
    if (nextIdx === prevIdx) return;
    this.selectSingle(shownIds[nextIdx]);
  }

  selectToggleSingle(id) {
    const idx = this.selectedIds.indexOf(id);
    this.changeSelectedIds(idx >= 0 ?
      removeAt(this.selectedIds, idx) :
      addLast(this.selectedIds, id));
  }

  changeSelectedIds(selectedIds) {
    this.selectedIds = selectedIds;
    this.forceUpdate();
    if (this.props.onChangeSelection) this.props.onChangeSelection(this.selectedIds);
  }

  scrollSelectedIntoView(options) {
    // TODO: tell VirtualScroller to scroll into that particular item
    // const { shownIds, selectedIds } = this;
    // if (!selectedIds.length) return;
    // const idx = shownIds.indexOf(selectedIds[0]);
    // if (idx < 0) return;
    // scrollIntoView(this.refItems[idx], options);
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

  sort(ids, props) {
    let out;
    if (this.sortBy === SORT_MANUALLY) {
      out = this.sortManually(ids, props);
    } else {
      out = this.sortAutomatically(ids, props);
    }
    return out;
  }

  sortManually(ids, props) {
    const { manuallyOrderedIds } = this;
    let fChangedManualOrder = false;
    let sortedIds;

    // If we don't have a previous list of `manuallyOrderedIds`, create one.
    // As a user, I would expect the IDs to remain exactly the same as they are just before
    // we switch to manual order, so just copy the list passed as argument
    if (manuallyOrderedIds == null) {
      this.manuallyOrderedIds = ids.slice();
      fChangedManualOrder = true;
      sortedIds = ids;

    // In the general case, we do have a list of `manuallyOrderedIds`, but its set of IDs
    // may differ from the `ids` list received as argument: `ids` may be filtered, it may be
    // empty because the records have not been fetched yet, etc.
    //
    // The following algorithm makes sure that:
    // - IDs that are both in `ids` and in `manuallyOrderedIds` are copies to the final list
    // in the order defined by `manuallyOrderedIds`
    // - All other IDs in the `ids` list (and *not* in `manuallyOrderedIds`) are appended
    // to both the output list *and* the `manuallyOrderedIds`
    } else {
      sortedIds = [];

      // Copy from `manuallyOrderedIds` only those IDs that are in the input list
      for (let i = 0; i < manuallyOrderedIds.length; i++) {
        const id = manuallyOrderedIds[i];
        if (ids.indexOf(id) >= 0) sortedIds.push(id);
      }

      // Append remaining IDs from the input list to the output and to `manuallyOrderedIds`
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        if (sortedIds.indexOf(id) < 0) {
          sortedIds.push(id);
          manuallyOrderedIds.push(id);
          fChangedManualOrder = true;
        }
      }
    }

    // Report to the user if he's interested and the manual order has changed
    if (fChangedManualOrder) this.manualOrderDidChange(props);

    return sortedIds;
  }

  sortAutomatically(ids, props) {
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

  changeSort(sortBy, sortDescending) {
    if (sortBy === this.sortBy && sortDescending === this.sortDescending) return;
    this.sortBy = sortBy;
    this.sortDescending = sortDescending;
    this.recalcShownIds(this.props);
    let ref = this.refVirtualScroller;
    if (ref) {
      if (ref.getWrappedInstance) ref = ref.getWrappedInstance();
      ref.scrollToTop();
    }
    this.forceUpdate();
    if (this.props.onChangeSort) this.props.onChangeSort({ sortBy, sortDescending });
  }

  manualOrderDidChange(props) {
    const { onChangeManualOrder, collectionName } = props;
    const { manuallyOrderedIds } = this;
    if (collectionName) localSet(this.getLocalStorageKey(collectionName), manuallyOrderedIds);
    if (onChangeManualOrder) onChangeManualOrder(manuallyOrderedIds);
    // console.log(`New manual order: ${this.manuallyOrderedIds.join(', ')}`)
  }

  getLocalStorageKey(collectionName) {
    return `dataTable.${collectionName}.manuallyOrderedIds`;
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
// Public API
// ===============================================================
export default DataTable;
export {
  SORT_MANUALLY,
};
