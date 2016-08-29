import React                from 'react';

const PropTypeColumn = React.PropTypes.shape({
  attr:                     React.PropTypes.string.isRequired,

  // Label
  label:                    React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func,
  ]),
  labelLevel:               React.PropTypes.number,  // useful for very narrow cols

  // Contents
  isDragHandle:             React.PropTypes.bool,
  rawValue:                 React.PropTypes.func,
  filterValue:              React.PropTypes.func,
  sortValue:                React.PropTypes.func,
  render:                   React.PropTypes.func,

  // Functionalities
  isSortable:               React.PropTypes.bool,  // true by default
  isSortableDescending:     React.PropTypes.bool,

  // Appearance
  isHidden:                 React.PropTypes.bool,
  minWidth:                 React.PropTypes.number,
  flexGrow:                 React.PropTypes.number,
  flexShrink:               React.PropTypes.number,
});

// ==========================================
// Component
// ==========================================
class DataTable extends React.Component {
  static propTypes = {
    items:                  React.PropTypes.array,
    cols:                   React.PropTypes.arrayOf(PropTypeColumn),
    idAttr:                 React.PropTypes.string,

    sortable:               React.PropTypes.bool,
    initialSortBy:          React.PropTypes.string,
    initialSortDescending:  React.PropTypes.bool,
    onChangeSort:           React.PropTypes.func,
    dontHandleSort:         React.PropTypes.bool,

    // - fetching
    // - filtering?
    // - sorting?
    // - styles
  };
  static defaultProps = {
    items:                  [],
    cols:                   [],
    idAttr:                 'id',
    sortable:               true,
    draggable:              false,
  };
}

// ==========================================
// Public API
// ==========================================
export default DataTable;
