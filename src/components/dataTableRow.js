import React                from 'react';
import { merge }            from 'timm';
import upperFirst           from 'lodash/upperFirst';
import isFunction           from 'lodash/isFunction';
import { bindAll }          from '../gral/helpers';
import { flexContainer }    from '../gral/styles';
import { COLORS }           from '../gral/constants';
import Spinner              from './spinner';
import Icon                 from './icon';

const DATA_TABLE_COLUMN_PROP_TYPES = React.PropTypes.shape({
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
  sortable:                 React.PropTypes.bool,  // true by default
  sortableDescending:       React.PropTypes.bool,  // true by default
  filterable:               React.PropTypes.bool,  // true by default

  // Appearance
  hidden:                   React.PropTypes.bool,
  minWidth:                 React.PropTypes.number,
  flexGrow:                 React.PropTypes.number,
  flexShrink:               React.PropTypes.number,
});

// ===============================================================
// Header
// ===============================================================
class DataTableHeader extends React.PureComponent {
  static propTypes = {
    cols:                   React.PropTypes.arrayOf(DATA_TABLE_COLUMN_PROP_TYPES),
    lang:                   React.PropTypes.string,
    maxLabelLevel:          React.PropTypes.number.isRequired,
    scrollbarWidth:         React.PropTypes.number.isRequired,
    sortBy:                 React.PropTypes.string,
    sortDescending:         React.PropTypes.bool,
    onClick:                React.PropTypes.func,
  };

  constructor(props) {
    super(props);
    bindAll(this, ['onClick']);
  }

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

  renderColHeader(col, idxCol) {
    const { attr, label, labelLevel, sortable } = col;
    let finalLabel;
    if (label != null) {
      finalLabel = isFunction(label) ? label() : label;
    } else {
      finalLabel = upperFirst(attr);
    }
    const fAttrIsSortable = this.props.onClick && !(sortable === false);
    const fAttrIsSortKey = fAttrIsSortable && attr === this.props.sortBy;
    const elIcon = fAttrIsSortKey ? this.renderSortIcon(this.props.sortDescending) : undefined;
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

  renderCallOut(level) {
    const h = 8 + 15 * level;
    const w = 5;
    const d = `M0,${h} l0,-${h} l${w},0`;
    return (
      <svg style={style.headerCallOut({ width: w, height: h })}>
        <path d={d} />
      </svg>
    );
  }

  renderSortIcon(fDescending) {
    const icon = fDescending ? 'caret-down' : 'caret-up';
    return <Icon icon={icon} style={style.headerSortIcon} />;
  }

  // ===============================================================
  // Event handlers
  // ===============================================================
  onClick(ev) {
    const attr = ev.currentTarget.id;
    this.props.onClick(attr);
  }
}

// ===============================================================
// Row
// ===============================================================
class DataTableRow extends React.PureComponent {
  static propTypes = {
    id:                     React.PropTypes.string.isRequired,
    item:                   React.PropTypes.object,
    cols:                   React.PropTypes.arrayOf(DATA_TABLE_COLUMN_PROP_TYPES),
    lang:                   React.PropTypes.string,
    selectedIds:            React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    fSortedManually:        React.PropTypes.bool,
    onMayHaveChangedHeight: React.PropTypes.func,
    onClick:                React.PropTypes.func,
    selectedBgColor:        React.PropTypes.string.isRequired,
    selectedFgColor:        React.PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    bindAll(this, ['onClick']);
  }

  componentDidUpdate() {
    const { onMayHaveChangedHeight } = this.props;
    if (onMayHaveChangedHeight) onMayHaveChangedHeight();
  }

  // ===============================================================
  // Render
  // ===============================================================
  render() {
    const { id } = this.props;
    console.log(`Rendering row ${id}...`);
    const fSelected = this.props.selectedIds.indexOf(id) >= 0;
    return (
      <div
        onClick={this.onClick}
        style={style.rowOuter(this.props, fSelected)}
      >
        {this.props.cols.map(this.renderCell, this)}
      </div>
    );
  }

  renderCell(col, idxCol) {
    const { attr, render } = col;
    const { item } = this.props;
    const value = render ?
      render({
        item,
        col,
        fSortedManually: this.props.fSortedManually,
        onMayHaveChangedHeight: this.props.onMayHaveChangedHeight,
      }) :
      item[attr];
    return (
      <div
        key={attr}
        style={style.rowCell(idxCol, col)}
      >
        {value}
      </div>
    );
  }

  // ===============================================================
  // Event handlers
  // ===============================================================
  onClick(ev) {
    const { onClick } = this.props;
    if (onClick) onClick(ev, this.props.id);
  }
}

// ===============================================================
// Other components
// ===============================================================
const DataTableFetchingRow = () =>
  <div style={style.fetchingRow}><Spinner size="lg" /></div>;

// ===============================================================
// Styles
// ===============================================================
const style = {
  rowOuterBase: flexContainer('row'),
  rowOuter: ({ selectedBgColor, selectedFgColor }, fSelected) => {
    let out = style.rowOuterBase;
    if (fSelected) {
      out = merge(out, {
        backgroundColor: selectedBgColor,
        color: selectedFgColor,
      });
    }
    return out;
  },
  fetchingRow: {
    marginTop: 1,
    marginBottom: 2,
  },
  headerOuter: ({ maxLabelLevel, scrollbarWidth }) => flexContainer('row', {
    marginRight: scrollbarWidth,
    marginTop: 2 + 15 * maxLabelLevel,
    marginBottom: 2,
    paddingBottom: 2,
    borderBottom: `1px solid ${COLORS.line}`,
  }),
  rowCell: (idxCol, {
    hidden,
    minWidth = 50,
    flexGrow,
    flexShrink,
  }) => {
    if (hidden) return { display: 'none' };
    const flexValue = `${flexGrow || 0} ${flexShrink || 0} ${minWidth}px`;
    return {
      flex: flexValue,
      WebkitFlex: flexValue,
      maxWidth: flexGrow ? undefined : minWidth,
      paddingLeft: 2,
      paddingRight: 2,
    };
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
  headerCallOut: base => merge(base, {
    position: 'absolute',
    right: '100%',
    top: 7,
    stroke: COLORS.line,
    strokeWidth: 1,
    fill: 'none',
  }),
  headerSortIcon: {
    marginLeft: 5,
  },
};

// ===============================================================
// Public API
// ===============================================================
export {
  DataTableHeader,
  DataTableRow,
  DataTableFetchingRow,
  DATA_TABLE_COLUMN_PROP_TYPES,
};
