// @flow

/* eslint-disable no-console */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import type { Element as ReactElement } from 'react';
import { merge } from 'timm';
import upperFirst from 'lodash/upperFirst';
import isFunction from 'lodash/isFunction';
import classnames from 'classnames';
import Spinner from './spinner';
import Icon from './icon';

const DEBUG = false && process.env.NODE_ENV !== 'production';

/* --
**Column definitions:**
-- */
/* -- START_DOCS -- */
export type DataTableColumn = {
  attr: string, // column identifier, also used to get rawValues by default

  // Label
  // -----
  // As a function, it will be called with the `commonCellProps`,
  // if defined, or otherwise with the `lang` property)
  label?: string | ((commonCellPropsOrLang: any) => string),
  labelLevel?: number, // useful for very narrow cols (default: 0)

  // Values
  // ------
  // Each cell has a "reference value", obtained through the `rawValue`
  // callback (if present) or the column's `attr` property.
  // The reference value is used for filtering, sorting, and copy events,
  // unless the corresponding callbacks are set.
  rawValue?: (item: Object) => any,
  filterValue?: (item: Object) => any,
  sortValue?: (item: Object) => any,

  // Rendering
  // ---------
  // By default, the reference value is rendered. Customize this by
  // specifying a `render` function.
  render?: (item: Object) => ReactElement<any>,

  // Functionalities
  // ---------------
  sortable?: boolean, // (default: true)
  sortableDescending?: boolean, // (default: true)
  filterable?: boolean, // (default: true)

  // Appearance
  // ----------
  hidden?: boolean,
  minWidth?: number,
  flexGrow?: number,
  flexShrink?: number,
};
/* -- END_DOCS -- */

// ===============================================================
// DataTableHeader
// ===============================================================
type DataTableHeaderProps = {
  cols: Array<DataTableColumn>,
  lang?: string, // just to force-refresh upon update
  commonCellProps?: Object,
  maxLabelLevel: number,
  scrollbarWidth: number,
  sortBy: ?string,
  sortDescending: boolean,
  onClick?: (attr: string) => any,
};

class DataTableHeader extends React.PureComponent<DataTableHeaderProps> {
  render() {
    return (
      <div
        className="giu-data-table-header"
        style={style.headerOuter(this.props)}
      >
        {this.props.cols.map(this.renderColHeader, this)}
      </div>
    );
  }

  renderColHeader(col: DataTableColumn, idxCol: number) {
    const { attr, label, labelLevel, sortable } = col;
    const { commonCellProps } = this.props;
    let finalLabel;
    if (label != null) {
      finalLabel = isFunction(label)
        ? // $FlowFixMe
          label(commonCellProps != null ? commonCellProps : this.props.lang)
        : label;
    } else {
      finalLabel = upperFirst(attr);
    }
    const fAttrIsSortable = this.props.onClick && !(sortable === false);
    const fAttrIsSortKey = fAttrIsSortable && attr === this.props.sortBy;
    const elIcon = fAttrIsSortKey
      ? this.renderSortIcon(this.props.sortDescending)
      : undefined;
    return (
      <div
        key={attr}
        id={attr}
        className={classnames(
          'giu-data-table-header-cell',
          'giu-data-table-cell',
          `giu-data-table-header-cell-level-${col.labelLevel || 0}`
        )}
        style={style.rowCell(idxCol, col)}
      >
        {labelLevel && this.renderCallOut(labelLevel)}
        <span
          id={attr}
          onClick={fAttrIsSortable ? this.onClick : undefined}
          className={
            fAttrIsSortable
              ? 'giu-data-table-header-cell-label-clickable'
              : undefined
          }
        >
          {(finalLabel: any)}
          {(elIcon: any)}
        </span>
      </div>
    );
  }

  renderCallOut(level: number) {
    const height = 8 + 15 * level;
    const width = 5;
    const d = `M0,${height} l0,-${height} l${width},0`;
    return (
      <svg className="giu-data-table-header-callout" style={{ width, height }}>
        <path d={d} />
      </svg>
    );
  }

  renderSortIcon(fDescending: boolean) {
    const icon = fDescending ? 'caret-down' : 'caret-up';
    return (
      <Icon className="giu-data-table-header-sort-icon" icon={icon} skipTheme />
    );
  }

  // ===============================================================
  onClick = (ev: SyntheticEvent<*>) => {
    if (!(ev.currentTarget instanceof Element)) return;
    const attr = ev.currentTarget.id;
    if (this.props.onClick) this.props.onClick(attr);
  };
}

// ===============================================================
// DataTableRow
// ===============================================================
type DataTableRowProps = {
  id: string,
  item: Object,
  cols: Array<DataTableColumn>,
  isItemSelected: boolean,
  fSortedManually: boolean,
  disableDragging: boolean,
  commonCellProps?: Object,
  onClick: (ev: SyntheticEvent<*>, id: string) => any,
  onDoubleClick: (ev: SyntheticEvent<*>, id: string) => any,
  onMayHaveChangedHeight: () => any,
};

class DataTableRow extends React.PureComponent<DataTableRowProps> {
  componentDidUpdate() {
    const { onMayHaveChangedHeight } = this.props;
    if (onMayHaveChangedHeight) onMayHaveChangedHeight();
  }

  // ===============================================================
  render() {
    const { id } = this.props;
    DEBUG && console.log(`Rendering row ${id}...`);
    return (
      <div
        className={classnames('giu-data-table-row', {
          'giu-data-table-row-selected': this.props.isItemSelected,
        })}
        onFocus={this.onClick}
        onClick={this.onClick}
        onDoubleClick={this.onDoubleClick}
      >
        {this.props.cols.map(this.renderCell, this)}
      </div>
    );
  }

  renderCell(col: DataTableColumn, idxCol: number) {
    const { attr, render } = col;
    const { id, item } = this.props;
    let value;
    if (render) {
      const cellProps = merge(
        {
          item,
          id,
          col,
          attr,
          isItemSelected: this.props.isItemSelected,
          fSortedManually: this.props.fSortedManually,
          disableDragging: this.props.disableDragging,
          onMayHaveChangedHeight: this.props.onMayHaveChangedHeight,
        },
        this.props.commonCellProps
      );
      value = render(cellProps);
    } else {
      value = item[attr];
    }
    return (
      <div
        key={attr}
        className="giu-data-table-cell"
        style={style.rowCell(idxCol, col)}
      >
        {value}
      </div>
    );
  }

  // ===============================================================
  onClick = (ev: SyntheticEvent<*>) => {
    const { onClick } = this.props;
    if (onClick) onClick(ev, this.props.id);
  };

  onDoubleClick = (ev: SyntheticEvent<*>) => {
    const { onDoubleClick } = this.props;
    if (onDoubleClick) onDoubleClick(ev, this.props.id);
  };
}

// ===============================================================
// Other components
// ===============================================================
const DataTableFetchingRow = () => (
  <div className="giu-data-table-fetching-row">
    <Spinner size="lg" />
  </div>
);

// ===============================================================
// Styles
// ===============================================================
const style = {
  headerOuter: ({ maxLabelLevel, scrollbarWidth }) => ({
    paddingRight: scrollbarWidth,
    paddingTop: 2 + 15 * maxLabelLevel,
  }),
  rowCell: (
    idxCol: number,
    { hidden, minWidth = 50, flexGrow, flexShrink }: DataTableColumn
  ) => {
    if (hidden) return { display: 'none' };
    const flexValue = `${flexGrow || 0} ${flexShrink || 0} ${minWidth}px`;
    return {
      flex: flexValue,
      WebkitFlex: flexValue,
      maxWidth: flexGrow ? undefined : minWidth,
    };
  },
};

// ===============================================================
// Public
// ===============================================================
export { DataTableHeader, DataTableRow, DataTableFetchingRow };
