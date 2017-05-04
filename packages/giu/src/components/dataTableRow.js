// @flow

/* eslint-disable no-console */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import { merge } from 'timm';
import upperFirst from 'lodash/upperFirst';
import isFunction from 'lodash/isFunction';
import { flexContainer } from '../gral/styles';
import { COLORS } from '../gral/constants';
import Spinner from './spinner';
import Icon from './icon';

const DEBUG = true && process.env.NODE_ENV !== 'production';

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
  render?: (item: Object) => React$Element<any>,

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
  style?: ?Object, // Mixed with each row/header cell's outer div
};
/* -- END_DOCS -- */

// ===============================================================
// Header
// ===============================================================
class DataTableHeader extends React.PureComponent {
  static propTypes: {
    cols: Array<DataTableColumn>,
    lang?: string, // just to force-refresh upon update
    commonCellProps?: Object,
    maxLabelLevel: number,
    scrollbarWidth: number,
    sortBy: ?string,
    sortDescending: boolean,
    onClick: (attr: string) => void,
    style?: Object,
  };

  // ===============================================================
  // Render
  // ===============================================================
  render() {
    return (
      <div style={style.headerOuter(this.props)}>
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
        onClick={fAttrIsSortable ? this.onClick : undefined}
        style={style.headerCell(idxCol, col, fAttrIsSortable)}
      >
        {labelLevel && this.renderCallOut(labelLevel)}
        {finalLabel}
        {elIcon}
      </div>
    );
  }

  renderCallOut(level: number) {
    const h = 8 + 15 * level;
    const w = 5;
    const d = `M0,${h} l0,-${h} l${w},0`;
    const { style: baseStyle } = this.props;
    return (
      <svg
        style={style.headerCallOut({
          width: w,
          height: h,
          stroke: baseStyle ? baseStyle.color : undefined,
        })}
      >
        <path d={d} />
      </svg>
    );
  }

  renderSortIcon(fDescending: boolean) {
    const icon = fDescending ? 'caret-down' : 'caret-up';
    return <Icon icon={icon} style={style.headerSortIcon} skipTheme />;
  }

  // ===============================================================
  // Event handlers
  // ===============================================================
  onClick = (ev: SyntheticEvent) => {
    if (!(ev.currentTarget instanceof Element)) return;
    const attr = ev.currentTarget.id;
    this.props.onClick(attr);
  };
}

// ===============================================================
// Row
// ===============================================================
class DataTableRow extends React.PureComponent {
  static propTypes: {
    id: string,
    item: Object,
    cols: Array<DataTableColumn>,
    selectedIds: Array<string>,
    commonCellProps: ?Object,
    fSortedManually: boolean,
    onMayHaveChangedHeight: () => void,
    onClick: (ev: SyntheticEvent, id: string) => void,
    style: ?Object,
    selectedBgColor: string,
    selectedFgColor: string,
  };

  componentDidUpdate() {
    const { onMayHaveChangedHeight } = this.props;
    if (onMayHaveChangedHeight) onMayHaveChangedHeight();
  }

  // ===============================================================
  // Render
  // ===============================================================
  render() {
    const { id } = this.props;
    DEBUG && console.log(`Rendering row ${id}...`);
    const fSelected = this.props.selectedIds.indexOf(id) >= 0;
    return (
      <div onClick={this.onClick} style={style.rowOuter(this.props, fSelected)}>
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
          fSortedManually: this.props.fSortedManually,
          onMayHaveChangedHeight: this.props.onMayHaveChangedHeight,
        },
        this.props.commonCellProps,
      );
      value = render(cellProps);
    } else {
      value = item[attr];
    }
    return (
      <div key={attr} style={style.rowCell(idxCol, col)}>
        {value}
      </div>
    );
  }

  // ===============================================================
  // Event handlers
  // ===============================================================
  onClick = (ev: SyntheticEvent) => {
    const { onClick } = this.props;
    if (onClick) onClick(ev, this.props.id);
  };
}

// ===============================================================
// Other components
// ===============================================================
const DataTableFetchingRow = () => (
  <div style={style.fetchingRow}><Spinner size="lg" /></div>
);

// ===============================================================
// Styles
// ===============================================================
const style = {
  rowOuterBase: flexContainer('row'),
  rowOuter: (
    { selectedBgColor, selectedFgColor, style: baseStyle },
    fSelected,
  ) => {
    const out = merge(
      style.rowOuterBase,
      {
        paddingTop: 1,
        paddingBottom: 1,
      },
      baseStyle,
    );
    if (fSelected) {
      out.backgroundColor = selectedBgColor;
      out.color = selectedFgColor;
    }
    return out;
  },
  fetchingRow: {
    marginTop: 1,
    marginBottom: 2,
  },
  headerOuter: ({ maxLabelLevel, scrollbarWidth, style: baseStyle }) =>
    merge(
      flexContainer('row', {
        paddingRight: scrollbarWidth,
        paddingTop: 2 + 15 * maxLabelLevel,
        paddingBottom: 2,
        borderBottom: `1px solid ${COLORS.line}`,
      }),
      baseStyle,
    ),
  rowCell: (
    idxCol: number,
    {
      hidden,
      minWidth = 50,
      flexGrow,
      flexShrink,
      style: baseStyle,
    }: DataTableColumn,
  ) => {
    if (hidden) return { display: 'none' };
    const flexValue = `${flexGrow || 0} ${flexShrink || 0} ${minWidth}px`;
    return merge(
      {
        flex: flexValue,
        WebkitFlex: flexValue,
        maxWidth: flexGrow ? undefined : minWidth,
        paddingLeft: 2,
        paddingRight: 2,
      },
      baseStyle,
    );
  },
  headerCell: (idxCol, col, fEnableHeaderClicks) => {
    const level = col.labelLevel || 0;
    let out = {
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      cursor: fEnableHeaderClicks ? 'pointer' : undefined,
    };
    out = merge(out, style.rowCell(idxCol, col));
    if (level) {
      out.position = 'relative';
      out.top = -15 * level;
      out.left = 16;
      out.overflowX = 'visible';
    } else {
      out.overflowX = 'hidden';
    }
    return out;
  },
  headerCallOut: base =>
    merge(
      {
        position: 'absolute',
        right: '100%',
        top: 7,
        stroke: COLORS.line,
        strokeWidth: 1,
        fill: 'none',
      },
      base,
    ),
  headerSortIcon: {
    marginLeft: 5,
  },
};

// ===============================================================
// Public API
// ===============================================================
export { DataTableHeader, DataTableRow, DataTableFetchingRow };
