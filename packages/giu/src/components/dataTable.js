// @flow

/* eslint-disable no-console */
import { merge, removeAt, addLast, insert } from 'timm';
import React from 'react';
import type { ComponentType } from 'react';
import {
  SortableContainer as sortableContainer,
  SortableElement as sortableElement,
  SortableHandle as sortableHandle,
  arrayMove,
} from 'react-sortable-hoc';
import type { ScrollIntoViewOptions } from '../gral/visibility';
import { COLORS, KEYS } from '../gral/constants';
import { isDark } from '../gral/styles';
import { cancelEvent, stopPropagation, simplifyString } from '../gral/helpers';
import { localGet, localSet } from '../gral/storage';
import { ThemeContext } from '../gral/themeContext';
import type { Theme } from '../gral/themeContext';
import { floatReposition } from './floats';
import VirtualScroller, { DEFAULT_ROW } from './virtualScroller';
import {
  DataTableHeader,
  DataTableRow,
  DataTableFetchingRow,
} from './dataTableRow';
import type { DataTableColumn } from './dataTableRow';
import FocusCapture from './focusCapture';
import Icon from './icon';

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
  render: ({ fSortedManually, disableDragging }) => (
    <DragHandle disabled={!fSortedManually || disableDragging} />
  ),
  /* eslint-enable react/prop-types */
  minWidth: 30,
  flexGrow: 0,
  flexShrink: 0,
});

const FOCUSABLE = ['input', 'textarea', 'select'];

const DEFER_SCROLL_INTO_VIEW_INITIAL = 700;
const DEFER_SCROLL_INTO_VIEW_AFTER_SORT_CHANGE_SLOW = 500;
const DEFER_SCROLL_INTO_VIEW_AFTER_SORT_CHANGE_FAST = 150;
const DEBUG = false && process.env.NODE_ENV !== 'production';

const DragHandle = sortableHandle(({ disabled }) => (
  <Icon icon="bars" disabled={disabled} style={style.dragHandle} skipTheme />
));

const SortableDataTableRow = sortableElement(DataTableRow);
const SortableVirtualScroller = sortableContainer(VirtualScroller, {
  withRef: true,
});

// ===============================================================
// Component
// ===============================================================
/* --
A full-featured table supporting filtering, single/multiple selection,
pagination, infinite scrolling, sorting, drag and drop, clipboard events,
localStorage, etc.

Following Giu's philosophy, DataTable allows you to choose whether you
want to control individual features yourself, or you're OK with the
default behaviour. In many cases, you can set initial props (e.g.
`sortBy`, `sortDescending`, `selectedIds`, `manuallyOrderedIds`)
and then leave Giu the gruntwork of managing all the state. In order
to indicate this, just don't modify any of those props yourself.
Alternatively, if you want to manage state yourself, use the provided
callbacks (`onChangeSort`, `onChangeSelection`, `onChangeManualOrder`)
and update your props accordingly.

DataTable improves performance by only rendering the rows that are
visible. Rows can have uniform and well-known heights
(at the simplest end of the spectrum), uniform but unknown,
and also dynamic: different for every row, and even changing
in time (as a result of passed-down props or their own intrinsic state).
-- */
/* eslint-disable max-len */
/* -- START_DOCS -- */
type PublicProps = {
  // Basic
  // -----
  itemsById?: Object, // Rows, keyed by id (default: {})
  cols: Array<DataTableColumn>, // Column configuration objects
  lang?: string, // Used to force-refresh when language changes

  // Set of rows to be shown (before filtering)
  // ------------------------------------------
  shownIds?: Array<string>, // Row ids to be shown (default: [], no rows)
  onChangeShownIds?: (shownIds: Array<string>) => any,
  alwaysRenderIds?: Array<string>, // Render these rows even when not visible (e.g. editing)
  commonCellProps?: Object, // Passed to all column `render` functions

  // Filtering
  // ---------
  filterValue?: string, // (default: '')
  neverFilterIds?: Array<string>, // shown no matter what

  // Sorting
  // -------
  headerClickForSorting?: boolean, // (default: true)
  onChangeSort?: (options: {
    sortBy: ?string,
    sortDescending: boolean,
  }) => any,
  sortBy?: ?string, // Column, identified by `attr`
  sortDescending?: boolean,
  customPositions?: { [id: string]: ?string }, // if position is null, it will be sent to the top

  // Manual sorting
  allowManualSorting?: boolean, // Add manual sort column (default: true)
  disableDragging?: boolean, // Keep the sort column (if any), but disable it (temporarily)
  manuallyOrderedIds?: Array<string>,
  onChangeManualOrder?: (
    manuallyOrderedIds: ?Array<string>,
    context: {
      draggedId?: string, // ID of the row that has been dragged
    }
  ) => any,
  manualSortColLabel?: string | (() => string), // Custom column label (default: 'Sort manually')

  // Selection
  // ---------
  selectedIds?: Array<string>,
  allowSelect?: boolean,
  multipleSelection?: boolean,
  onChangeSelection?: (selectedIds: Array<string>) => any,
  onClipboardAction?: (ev: SyntheticClipboardEvent<*>, json: string) => any,
  onRowDoubleClick?: (ev: SyntheticMouseEvent<*>, id: string) => any,

  // Fetching
  // --------
  // Set fetchMoreItems if you want DataTable to notify you when the last row is rendered
  // (note: disabled when the filterValue prop is not empty)
  fetchMoreItems?: (lastRowId: string) => any, // Called when the last row is rendered
  fetching?: boolean, // When set, the FetchRowComponent will be shown
  FetchRowComponent?: ComponentType<any>,

  // LocalStorage
  // ------------
  // Set collectionName if you want DataTable to persist some user prefs to localStorage:
  // sort criteria, manual order, selection...
  collectionName?: string,

  // Miscellaneous
  // -------------
  emptyIndicator?: any,

  // Styles
  // ------
  height?: number, // Body height (default: 200)
  width?: number, // (default: default div block behaviour)
  rowHeight?: number, // Auto-calculated if unspecified
  uniformRowHeight?: boolean, // Are rows of the same height (even if unknown a priori)? (default: false)
  showHeader?: boolean, // (default: true)
  style?: Object,
  styleHeader?: Object,
  styleRow?: Object,
  animated?: boolean,

  // For VirtualScroller specifically
  estimatedMinRowHeight?: number,
  numRowsInitialRender?: number,
  maxRowsToRenderInOneGo?: number,
};
/* -- END_DOCS -- */
/* eslint-enable max-len */

type DefaultProps = {
  itemsById: Object,
  shownIds: Array<string>,
  filterValue: string,
  neverFilterIds: Array<string>,
  headerClickForSorting: boolean,
  allowManualSorting: boolean,
  manualSortColLabel: string | (() => string),
  allowSelect: boolean,
  multipleSelection: boolean,
  fetching: boolean,
  FetchRowComponent: ComponentType<any>,
  height: number,
};

type UnthemedProps = {
  ...$Exact<PublicProps>,
  ...$Exact<DefaultProps>,
};

type Props = {
  ...$Exact<UnthemedProps>,
  // Context
  theme: Theme,
};

class DataTable extends React.PureComponent<Props> {
  cols: Array<DataTableColumn>;
  maxLabelLevel: number;
  scrollbarWidth: number;
  fDragging: boolean;
  filterValue: string;
  sortBy: ?string;
  sortDescending: boolean;
  manuallyOrderedIds: ?Array<string>;
  shownIds: Array<string>;
  prevShownIds: Array<string>;
  selectedIds: Array<string>;
  prevSelectedIds: Array<string>;
  commonRowProps: Object;
  selectedBgColor: string;
  selectedFgColor: string;
  fPendingInitialScrollIntoView: boolean;
  RowComponents: { [key: string]: ComponentType<any> };
  refVirtualScroller: ?Object;

  refOuter: any = React.createRef();
  refFocusCapture: any = React.createRef();
  static defaultProps: DefaultProps = {
    itemsById: {},
    shownIds: ([]: Array<string>),

    filterValue: '',
    neverFilterIds: ([]: Array<string>),

    headerClickForSorting: true,

    allowManualSorting: true,
    disableDragging: false,
    manualSortColLabel: 'Sort manually',

    allowSelect: true,
    multipleSelection: true,

    fetching: false,
    FetchRowComponent: DataTableFetchingRow,

    showHeader: true,
    height: 200,
  };

  constructor(props: Props) {
    super(props);
    this.scrollbarWidth = 0;
    this.fDragging = false;
    this.recalcCols(props);
    // State initialised by outer props, then free to change by default
    this.filterValue = props.filterValue;
    ['sortBy', 'sortDescending', 'selectedIds', 'manuallyOrderedIds'].forEach(
      key => {
        // $FlowFixMe
        this[key] = undefined;
        if (props[key] != null) {
          // $FlowFixMe
          this[key] = props[key];
        } else if (props.collectionName) {
          // $FlowFixMe
          this[key] = localGet(this.localStorageKey(props.collectionName, key));
        }
      }
    );
    if (this.sortBy === undefined) this.sortBy = null;
    if (this.sortDescending == null) this.sortDescending = false;
    if (this.selectedIds == null) this.selectedIds = [];
    this.recalcShownIds(props);
    this.recalcRowComponents(props);
    this.recalcColors(props);
    this.commonRowProps = {};
  }

  // Scroll into view upon mount; do it asynchronously to allow
  // height measurements to stabilise. This scrolling is only useful
  // if there are rows in the initial render
  componentDidMount() {
    this.fPendingInitialScrollIntoView = true;
    setTimeout(() => {
      this.fPendingInitialScrollIntoView = false;
      this.scrollSelectedIntoView({ topAncestor: this.refOuter.current });
    }, DEFER_SCROLL_INTO_VIEW_INITIAL);
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      itemsById,
      cols,
      shownIds,
      filterValue,
      sortBy,
      sortDescending,
      collectionName,
      allowManualSorting,
      manuallyOrderedIds,
      selectedIds,
      FetchRowComponent,
      theme,
    } = nextProps;
    let fRecalcShownIds = false;
    if (itemsById !== this.props.itemsById) fRecalcShownIds = true;
    if (
      cols !== this.props.cols ||
      allowManualSorting !== this.props.allowManualSorting
    ) {
      this.recalcCols(nextProps);
      fRecalcShownIds = true;
    }
    if (shownIds !== this.props.shownIds) fRecalcShownIds = true;
    if (filterValue !== this.props.filterValue) {
      this.filterValue = filterValue;
      fRecalcShownIds = true;
    }
    if (
      sortBy !== this.props.sortBy ||
      sortDescending !== this.props.sortDescending
    ) {
      this.sortBy = sortBy;
      this.sortDescending = !!sortDescending;
      this.localStorageSave(collectionName, 'sortBy', this.sortBy);
      this.localStorageSave(
        collectionName,
        'sortDescending',
        this.sortDescending
      );
      fRecalcShownIds = true;
    }
    if (manuallyOrderedIds !== this.props.manuallyOrderedIds) {
      this.manuallyOrderedIds = manuallyOrderedIds;
      this.localStorageSave(
        collectionName,
        'manuallyOrderedIds',
        this.manuallyOrderedIds
      );
      if (sortBy === SORT_MANUALLY) fRecalcShownIds = true;
    }
    if (fRecalcShownIds) this.recalcShownIds(nextProps);
    if (selectedIds !== this.props.selectedIds) {
      this.selectedIds = (selectedIds: any);
      this.localStorageSave(collectionName, 'selectedIds', this.selectedIds);
    }
    if (
      FetchRowComponent !== this.props.FetchRowComponent ||
      allowManualSorting !== this.props.allowManualSorting
    ) {
      this.recalcRowComponents(nextProps);
    }
    if (theme.accentColor !== this.props.theme.accentColor)
      this.recalcColors(nextProps);
  }

  recalcCols(props: Props) {
    if (props.allowManualSorting) {
      this.cols = [
        createManualSortCol(props.manualSortColLabel),
        ...props.cols,
      ];
    } else {
      this.cols = props.cols;
    }
    this.recalcMaxLabelLevel();
  }

  recalcMaxLabelLevel() {
    const { cols } = this;
    let maxLabelLevel = 0;
    for (let i = 0; i < cols.length; i++) {
      const { labelLevel } = cols[i];
      if (labelLevel != null && labelLevel > maxLabelLevel) {
        maxLabelLevel = labelLevel;
      }
    }
    this.maxLabelLevel = maxLabelLevel;
  }

  recalcRowComponents(props: Props) {
    this.RowComponents = {
      [FETCHING_MORE_ITEMS_ROW]: props.FetchRowComponent,
      [DEFAULT_ROW]: props.allowManualSorting
        ? SortableDataTableRow
        : DataTableRow,
    };
  }

  recalcColors(props: Props) {
    const { accentColor } = props.theme;
    this.selectedBgColor = accentColor;
    this.selectedFgColor =
      COLORS[isDark(accentColor) ? 'lightText' : 'darkText'];
  }

  recalcShownIds(props: Props) {
    let { shownIds } = props;
    shownIds = this.filter(shownIds, props);
    shownIds = this.sort(shownIds, props);
    this.shownIds = shownIds;
  }

  componentDidUpdate() {
    const { shownIds, prevShownIds, selectedIds, prevSelectedIds } = this;
    if (shownIds !== prevShownIds) {
      this.props.onChangeShownIds && this.props.onChangeShownIds(shownIds);
      this.selectRemoveHidden();
    }
    if (
      selectedIds !== prevSelectedIds &&
      !this.fPendingInitialScrollIntoView
    ) {
      this.scrollSelectedIntoView();
    }
    this.prevShownIds = shownIds;
    this.prevSelectedIds = selectedIds;
  }

  // ==========================================
  // Imperative API
  // ==========================================
  focus() {
    if (this.refFocusCapture.current) this.refFocusCapture.current.focus();
  }
  // scrollToTop: see below

  // ===============================================================
  // Render
  // ===============================================================
  render() {
    DEBUG && console.log('DataTable: rendering...');
    let className = `giu-data-table ${
      this.fDragging ? 'dragging' : 'not-dragging'
    }`;
    if (this.props.animated) className += ' animated';
    return (
      <div
        ref={this.refOuter}
        className={className}
        onClick={this.onClickOuter}
        style={style.outer(this.props)}
      >
        {this.renderFocusCapture()}
        {this.props.showHeader && this.renderHeader()}
        {this.renderVirtualScroller()}
        {STYLES}
      </div>
    );
  }

  renderFocusCapture() {
    return (
      <FocusCapture
        registerRef={this.refFocusCapture}
        onKeyDown={this.onKeyDown}
        onCopy={this.onCopyCut}
        onCut={this.onCopyCut}
        onPaste={this.onPaste}
      />
    );
  }

  renderHeader() {
    return (
      <DataTableHeader
        cols={this.cols}
        lang={this.props.lang} // to force-refresh when it changes
        commonCellProps={this.props.commonCellProps}
        maxLabelLevel={this.maxLabelLevel}
        scrollbarWidth={this.scrollbarWidth}
        sortBy={this.sortBy}
        sortDescending={this.sortDescending}
        onClick={
          this.props.headerClickForSorting ? this.onClickHeader : undefined
        }
        style={this.props.styleHeader}
      />
    );
  }

  renderVirtualScroller() {
    const { lang, filterValue, allowManualSorting } = this.props;
    const { cols, sortBy } = this;

    const fSortedManually = sortBy === SORT_MANUALLY;

    // Timm will make sure `this.commonRowProps` doesn't change unless
    // any of the merged properties changes.
    this.commonRowProps = merge(this.commonRowProps, {
      cols,
      lang,
      fSortedManually: allowManualSorting ? fSortedManually : undefined,
      disableDragging: this.props.disableDragging,
      commonCellProps: this.props.commonCellProps,
      onClick: this.props.allowSelect ? this.onClickRow : undefined,
      onDoubleClick: this.props.onRowDoubleClick,
      style: this.props.styleRow,
      selectedBgColor: this.selectedBgColor,
      selectedFgColor: this.selectedFgColor,
    });

    // Get the ordered list of IDs to be shown
    const shownIds = this.shownIds.slice();
    if (this.props.fetching) shownIds.push(FETCHING_MORE_ITEMS_ROW);
    const ChosenVirtualScroller = allowManualSorting
      ? SortableVirtualScroller
      : VirtualScroller;

    return (
      <ChosenVirtualScroller
        ref={c => {
          this.refVirtualScroller = c;
        }}
        itemsById={this.props.itemsById}
        shownIds={shownIds}
        alwaysRenderIds={this.props.alwaysRenderIds}
        RowComponents={this.RowComponents}
        commonRowProps={this.commonRowProps}
        getSpecificRowProps={this.getSpecificRowProps}
        height={this.props.height}
        width={this.props.width}
        rowHeight={this.props.rowHeight}
        uniformRowHeight={this.props.uniformRowHeight}
        onRenderLastRow={filterValue ? undefined : this.onRenderLastRow}
        onChangeScrollbarWidth={this.onChangeScrollbarWidth}
        numRowsInitialRender={this.props.numRowsInitialRender}
        estimatedMinRowHeight={this.props.estimatedMinRowHeight}
        maxRowsToRenderInOneGo={this.props.maxRowsToRenderInOneGo}
        emptyIndicator={this.props.emptyIndicator}
        style={style.scroller}
        // For the sortable variant...
        useDragHandle={allowManualSorting ? true : undefined}
        onSortStart={allowManualSorting ? this.onDragStart : undefined}
        onSortEnd={allowManualSorting ? this.onDragEnd : undefined}
        helperClass="giu-data-table-dragged-row"
      />
    );
  }

  getSpecificRowProps = (id: string) => ({
    isItemSelected: this.selectedIds.indexOf(id) >= 0,
  });

  // ===============================================================
  // Event handlers
  // ===============================================================
  onKeyDown = (ev: SyntheticKeyboardEvent<*>) => {
    if (ev.which === KEYS.up || ev.which === KEYS.down) {
      this.selectMoveDelta(ev.which === KEYS.up ? -1 : +1);
      cancelEvent(ev);
    } else if (ev.which === KEYS.pageUp || ev.which === KEYS.pageDown) {
      this.scrollPageUpDown(ev.which === KEYS.pageUp ? -1 : +1);
      cancelEvent(ev);
    }
  };

  // Except when clicking on an embedded focusable node, refocus on this table
  // Prevent bubbling of click events; they may reach Modals
  // on their way up and cause the element to blur.
  onClickOuter = (ev: SyntheticEvent<*>) => {
    if (!(ev.target instanceof Element)) return;
    const { tagName, disabled } = (ev.target: any);
    if (FOCUSABLE.indexOf(tagName.toLowerCase()) >= 0 && !disabled) return;
    this.focus();
    stopPropagation(ev);
  };

  onRenderLastRow = (id: string) => {
    if (id === FETCHING_MORE_ITEMS_ROW) return;
    const { fetchMoreItems } = this.props;
    if (!fetchMoreItems) return;
    fetchMoreItems(id);
  };

  onChangeScrollbarWidth = (scrollbarWidth: number) => {
    this.scrollbarWidth = scrollbarWidth;
    DEBUG &&
      console.log('DataTable: scrollbarWidth has changed. Re-rendering...');
    this.forceUpdate();
  };

  onClickHeader = (attr: string) => {
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
  };

  // Will also get called on row focus
  onClickRow = (ev: SyntheticMouseEvent<*>, id: string) => {
    const fMultiSelect =
      (ev.metaKey || ev.ctrlKey) && this.props.multipleSelection;
    if (fMultiSelect) {
      this.selectToggleSingle(id);
    } else {
      this.selectSingle(id);
    }
  };

  onDragStart = () => {
    this.fDragging = true;
    this.forceUpdate();
    floatReposition();
  };

  onDragEnd = ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number,
    newIndex: number,
  }) => {
    // Convert indices in `shownIds` to indices in `manuallyOrderedIds`
    const { shownIds, manuallyOrderedIds } = this;
    if (manuallyOrderedIds == null) return;
    const finalOldIndex = manuallyOrderedIds.indexOf(shownIds[oldIndex]);
    const finalNewIndex = manuallyOrderedIds.indexOf(shownIds[newIndex]);
    if (finalOldIndex < 0 || finalNewIndex < 0) return;

    // Update `manuallyOrderedIds`, creating a new array
    // console.log(`DataTable: moved #${finalOldIndex} to #${finalNewIndex}`);
    this.manuallyOrderedIds = arrayMove(
      this.manuallyOrderedIds,
      finalOldIndex,
      finalNewIndex
    );

    // Update `shownIds` so that the changes are reflected. Then report on them to the user
    // and re-render
    this.recalcShownIds(this.props);
    this.manualOrderDidChange(this.props, { draggedId: shownIds[oldIndex] });
    this.forceUpdate();
    floatReposition();

    // Finally, and asynchronously (to allow time for the previous re-render),
    // set `fDragging` to `false` and re-render, to enable `VerticalManager` animations again
    // (which were disabled during dragging)
    setImmediate(() => {
      this.fDragging = false;
      this.forceUpdate();
    });
  };

  // ===============================================================
  // Clipboard
  // ===============================================================
  onCopyCut = (ev: SyntheticClipboardEvent<*>) => {
    const json = this.getJsonForClipboard();
    ev.clipboardData.setData('text/plain', json);
    ev.preventDefault();
    if (this.props.onClipboardAction) {
      this.props.onClipboardAction(ev, json);
    }
  };

  onPaste = (ev: SyntheticClipboardEvent<*>) => {
    const json = ev.clipboardData.getData('text/plain');
    ev.preventDefault();
    if (this.props.onClipboardAction) {
      this.props.onClipboardAction(ev, json);
    }
  };

  getJsonForClipboard() {
    try {
      const { itemsById, cols } = this.props;
      const { selectedIds } = this;
      const allRowValues = {};
      selectedIds.forEach(id => {
        const rowValues = {};
        const item = itemsById[id];
        if (!item) return;
        cols.forEach(col => {
          const { attr } = col;
          rowValues[attr] = col.rawValue ? col.rawValue(item) : item[attr];
        });
        allRowValues[id] = rowValues;
      });
      const json = JSON.stringify(allRowValues, null, '  ');
      return json;
    } catch (err) {
      console.error(err);
      return '';
    }
  }

  // ===============================================================
  // Selection
  // ===============================================================
  selectSingle(id: string) {
    if (this.selectedIds.length === 1 && this.selectedIds[0] === id) return;
    this.changeSelectedIds([id]);
  }

  selectMoveDelta(delta: number) {
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

  selectToggleSingle(id: string) {
    const idx = this.selectedIds.indexOf(id);
    this.changeSelectedIds(
      idx >= 0 ? removeAt(this.selectedIds, idx) : addLast(this.selectedIds, id)
    );
  }

  selectRemoveHidden() {
    const { shownIds, selectedIds } = this;
    const nextSelectedIds = [];
    for (let i = 0; i < selectedIds.length; i++) {
      const id = selectedIds[i];
      if (shownIds.indexOf(id) >= 0) nextSelectedIds.push(id);
    }
    if (nextSelectedIds.length !== selectedIds.length) {
      this.changeSelectedIds(nextSelectedIds);
    }
  }

  changeSelectedIds(selectedIds: Array<string>) {
    this.selectedIds = selectedIds;
    this.localStorageSave(
      this.props.collectionName,
      'selectedIds',
      this.selectedIds
    );
    this.forceUpdate();
    if (this.props.onChangeSelection) {
      this.props.onChangeSelection(this.selectedIds);
    }
  }

  // ===============================================================
  // Scrolling
  // ===============================================================
  scrollToTop() {
    const refVirtualScroller = this.getVirtualScrollerRef();
    if (refVirtualScroller) refVirtualScroller.scrollToTop();
  }

  scrollPageUpDown(sign: number) {
    const refVirtualScroller = this.getVirtualScrollerRef();
    if (refVirtualScroller) refVirtualScroller.scrollPageUpDown(sign);
  }

  scrollSelectedIntoView(options?: ScrollIntoViewOptions) {
    const refVirtualScroller = this.getVirtualScrollerRef();
    if (!refVirtualScroller) return;
    if (!this.selectedIds.length) return;
    DEBUG &&
      console.log(
        `DataTable: triggering a scrollIntoView... ${this.selectedIds.join(
          ','
        )}`
      );
    refVirtualScroller.scrollIntoView(this.selectedIds[0], options);
  }

  getVirtualScrollerRef() {
    let out = this.refVirtualScroller;
    if (out && out.getWrappedInstance) out = out.getWrappedInstance();
    return out;
  }

  // ===============================================================
  // Filtering
  // ===============================================================
  filter(ids: Array<string>, props: Props) {
    let needle = this.filterValue;
    if (!needle) return ids;
    needle = simplifyString(needle);
    const { itemsById, neverFilterIds } = props;
    const cols = this.cols.filter(col => col.filterable !== false);
    const numCols = cols.length;
    const filteredIds = [];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (neverFilterIds.indexOf(id) >= 0) {
        filteredIds.push(id);
        continue;
      }
      const item = itemsById[id];
      let fInclude = false;
      for (let k = 0; k < numCols; k++) {
        const col = cols[k];
        let haystack = col.filterValue
          ? col.filterValue(item)
          : col.rawValue
            ? col.rawValue(item)
            : item[col.attr];
        if (haystack == null || !haystack.toLowerCase) continue;
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

  // ===============================================================
  // Sorting
  // ===============================================================
  sort(ids: Array<string>, props: Props) {
    let out;
    if (this.sortBy === SORT_MANUALLY) {
      out = this.sortManually(ids, props);
    } else {
      out = this.sortAutomatically(ids, props);
    }
    out = this.processCustomPositions(out, props);
    return out;
  }

  sortManually(ids: Array<string>, props: Props) {
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
    if (fChangedManualOrder) this.manualOrderDidChange(props, {});

    return sortedIds;
  }

  sortAutomatically(ids: Array<string>, props: Props) {
    const { sortBy, sortDescending } = this;
    const { itemsById } = props;
    if (!sortBy) return ids;
    const col = this.cols.find(o => o.attr === sortBy);
    if (!col) return ids;
    const getSortValue =
      col.sortValue || col.rawValue || (item => item[sortBy]);
    const sortValues = {};
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      sortValues[id] = getSortValue(itemsById[id]);
    }
    const sortedIds: Array<string> = ids.slice();
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

  processCustomPositions(ids: Array<string>, props: Props): Array<string> {
    const { customPositions } = props;
    if (!customPositions) return ids;
    if (!Object.keys(customPositions).length) return ids;

    // Extract row IDs with custom positions
    let out = [];
    const pending = [];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (customPositions[id] === undefined) {
        out.push(id);
      } else {
        pending.push(id);
      }
    }
    if (!pending.length) return out;

    // Process pending rows
    const top = [];
    for (let i = 0; i < pending.length; i++) {
      const id = pending[i];
      const afterId = customPositions[id];
      if (afterId === undefined) continue; // avoids Flow error
      if (afterId === null) {
        top.push(id);
        continue;
      }
      const idx = out.indexOf(afterId);
      if (idx < 0) {
        top.push(id);
        continue;
      }
      out = insert(out, idx + 1, id);
    }

    return top.concat(out);
  }

  changeSort(sortBy: ?string, sortDescending: boolean) {
    if (sortBy === this.sortBy && sortDescending === this.sortDescending) {
      return;
    }
    this.sortBy = sortBy;
    this.sortDescending = sortDescending;
    this.localStorageSave(this.props.collectionName, 'sortBy', this.sortBy);
    this.localStorageSave(
      this.props.collectionName,
      'sortDescending',
      this.sortDescending
    );
    this.recalcShownIds(this.props);
    if (this.selectedIds.length) {
      const delay = this.props.animated
        ? DEFER_SCROLL_INTO_VIEW_AFTER_SORT_CHANGE_SLOW
        : DEFER_SCROLL_INTO_VIEW_AFTER_SORT_CHANGE_FAST;
      setTimeout(() => {
        this.scrollSelectedIntoView();
      }, delay);
    } else {
      this.scrollToTop();
    }
    setTimeout(floatReposition, 100);
    this.forceUpdate();
    if (this.props.onChangeSort) {
      this.props.onChangeSort({ sortBy, sortDescending });
    }
  }

  manualOrderDidChange(props: Props, context: Object) {
    this.localStorageSave(
      props.collectionName,
      'manuallyOrderedIds',
      this.manuallyOrderedIds
    );
    if (props.onChangeManualOrder) {
      props.onChangeManualOrder(this.manuallyOrderedIds, context);
    }
    // console.log(`New manual order: ${this.manuallyOrderedIds.join(', ')}`)
  }

  localStorageSave(collectionName: ?string, key: string, value: any) {
    if (!collectionName) return;
    localSet(this.localStorageKey(collectionName, key), value);
  }

  localStorageKey(collectionName: string, key: string): string {
    return `dataTable.${collectionName}.${key}`;
  }
}

// ==========================================
// Theme
// ===============================================================
const ThemedDataTable = (props: UnthemedProps) => (
  <ThemeContext.Consumer>
    {theme => <DataTable {...props} theme={theme} />}
  </ThemeContext.Consumer>
);

// ===============================================================
// Styles
// ===============================================================
const style = {
  outer: ({ style: baseStyle }) =>
    merge(
      {
        maxWidth: '100%',
        overflowX: 'hidden',
      },
      baseStyle
    ),
  dragHandle: {
    marginLeft: 4,
    marginRight: 3,
  },
  scroller: {
    marginTop: 2,
    marginBottom: 2,
  },
};

const STYLES = (
  <style jsx global>{`
    /* Important transition, no only aesthetically. When a row's contents changes height
  and it is not shown because it is above the viewport, wheneve the user scrolls up
  to that row it will get rendered, report on its new height, and all of the subsequent
  rows will get repositioned. This should happen slowly to avoid confusing jumps
  while scrolling */
    .giu-data-table.not-dragging.animated .giu-vertical-manager {
      transition: top 300ms;
    }

    /* Just in case a DataTable lands on a Modal: make sure the dragged
  row is drawn above the modal, not below */
    .giu-data-table-dragged-row {
      z-index: 50000;
    }
  `}</style>
);

// ===============================================================
// Public
// ===============================================================
export default ThemedDataTable;
export { SORT_MANUALLY };
