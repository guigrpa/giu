import React                from 'react';
import { merge }            from 'timm';
import upperFirst           from 'lodash/upperFirst';
import isFunction           from 'lodash/isFunction';
import { flexContainer }    from '../gral/styles';
import Spinner              from './spinner';

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

  // Appearance
  hidden:                   React.PropTypes.bool,
  minWidth:                 React.PropTypes.number,
  flexGrow:                 React.PropTypes.number,
  flexShrink:               React.PropTypes.number,
});

const FOOTER_ROW = '__FOOTER_ROW__';

// ===============================================================
// Header
// ===============================================================
class DataTableHeader extends React.PureComponent {
  static propTypes = {
    cols:                   React.PropTypes.arrayOf(DATA_TABLE_COLUMN_PROP_TYPES),
    scrollbarWidth:         React.PropTypes.number.isRequired,
  };

  render() {
    return (
      <div style={style.headerOuter(this.props)}>
        {this.props.cols.map(this.renderColHeader, this)}
      </div>
    );
  }

  renderColHeader(col, idxCol) {
    const { attr, label } = col;
    let finalLabel;
    if (label != null) {
      finalLabel = isFunction(label) ? label() : label;
    } else {
      finalLabel = upperFirst(attr);
    }
    return (
      <div
        key={attr}
        style={style.headerCell(idxCol, col)}
      >
        {finalLabel}
      </div>
    );
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
    selectedIds:            React.PropTypes.arrayOf(React.PropTypes.string),
    onMayHaveChangedHeight: React.PropTypes.func,
  };

  componentDidUpdate() {
    const { onMayHaveChangedHeight } = this.props;
    // console.log(`Row ${this.props.id} didUpdate`);
    if (onMayHaveChangedHeight) onMayHaveChangedHeight();
  }

  render() {
    if (this.props.id === FOOTER_ROW) {
      return <div><Spinner size="lg" /></div>;
    }
    // console.log(`Rendering row ${id}...`);
    return (
      <div style={style.rowOuter}>
        {this.props.cols.map(this.renderCell, this)}
      </div>
    );
  }

  renderCell(col, idxCol) {
    const { attr, render } = col;
    const { item } = this.props;
    const value = render ?
      render({ item, col, onMayHaveChangedHeight: this.props.onMayHaveChangedHeight }) :
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
}

// ===============================================================
// Styles
// ===============================================================
const style = {
  rowOuter: flexContainer('row'),
  headerOuter: ({ scrollbarWidth }) => flexContainer('row', {
    marginRight: scrollbarWidth,
    overflowX: 'hidden',
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
  headerCell: (idxCol, col) => merge(style.rowCell(idxCol, col), {
    fontWeight: 'bold',
  }),
};

// ===============================================================
// Public API
// ===============================================================
export {
  DataTableHeader,
  DataTableRow,
  DATA_TABLE_COLUMN_PROP_TYPES,
  FOOTER_ROW,
};
