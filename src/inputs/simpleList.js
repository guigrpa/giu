import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { merge }            from 'timm';
import {
  COLORS,
  UNICODE,
  KEYS,
  getScrollbarWidth,
}                           from '../gral/constants';
import {
  bindAll,
  cancelEvent,
}                           from '../gral/helpers';
import input                from '../hocs/input';
import hoverable            from '../hocs/hoverable';

const NULL_VALUE = '__NULL__';
function toInternalValue(val) { return val != null ? JSON.stringify(val) : NULL_VALUE; }
function toExternalValue(val) { return val !== NULL_VALUE ? JSON.parse(val) : null; }

// ==========================================
// Component
// ==========================================
class SimpleList extends React.Component {
  static propTypes = {
    items:                  React.PropTypes.array.isRequired,
    emptyText:              React.PropTypes.string,
    onClickItem:            React.PropTypes.func,
    onKeyDownReturn:        React.PropTypes.func,
    onKeyDownEsc:           React.PropTypes.func,
    style:                  React.PropTypes.object,
    styleItem:              React.PropTypes.object,
    twoStageStyle:          React.PropTypes.bool,
    // Hoverable HOC
    hovering:               React.PropTypes.any,
    onHoverStart:           React.PropTypes.func.isRequired,
    onHoverStop:            React.PropTypes.func.isRequired,
    // Input HOC
    curValue:               React.PropTypes.string.isRequired,
    onChange:               React.PropTypes.func.isRequired,
  };
  static defaultProps = {
    emptyText:              'Ø',
    twoStageStyle:          false,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    bindAll(this, [
      'renderItem',
      'onClickItem',
    ]);
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { items, style: baseStyle } = this.props;
    if (!items.length ||
        (items.length === 1 && items[0].value === '' && items[0].label === '')) {
      const styleEmpty = merge(style.outer, style.empty, baseStyle);
      return <div style={styleEmpty}>{this.props.emptyText}</div>;
    }
    return (
      <div
        className="giu-simple-list"
        style={merge(style.outer, baseStyle)}
        onMouseDown={cancelEvent}
      >
        {items.map(this.renderItem)}
      </div>
    );
  }

  renderItem(item) {
    const { value: itemValue, label } = item;
    const {
      curValue,
      hovering,
      onHoverStart,
      onHoverStop,
      styleItem,
      twoStageStyle,
    } = this.props;
    const id = toInternalValue(itemValue);
    const styleProps = {
      hovering,
      fHovered: hovering === id,
      fSelected: curValue === id,
      twoStageStyle,
    };
    return (
      <div key={id}
        id={id}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverStop}
        onMouseUp={this.onClickItem}
        style={merge(style.item(styleProps), styleItem)}
      >
        {label || UNICODE.nbsp}
      </div>
    );
  }

  // ==========================================
  // Event handlers
  // ==========================================
  onClickItem(ev) {
    const { onClickItem, onChange } = this.props;
    onChange(ev);
    if (onClickItem) onClickItem(ev);
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outer: {
    paddingTop: 3,
    paddingBottom: 3,
    overflowY: 'auto',
  },
  empty: {
    fontStyle: 'italic',
    color: COLORS.dim,
    paddingRight: 10 + getScrollbarWidth(),
    paddingLeft: 10,
    cursor: 'not-allowed',
  },
  item: ({ hovering, fHovered, fSelected, twoStageStyle }) => {
    let border;
    let backgroundColor;
    let color;
    if (twoStageStyle) {
      border = `1px solid ${fHovered || fSelected ? COLORS.accent : 'transparent'}`;
      backgroundColor = fSelected ? COLORS.accent : 'transparent';
      color = fSelected ? COLORS.textOnAccent : undefined;
    } else {
      const fHighlighted = fHovered || (fSelected && hovering == null);
      backgroundColor = fHighlighted ? COLORS.accent : 'transparent';
      color = fHighlighted ? COLORS.textOnAccent : undefined;
    }
    return {
      backgroundColor, color, border,
      cursor: 'default',
      whiteSpace: 'nowrap',
      padding: `3px ${10 + getScrollbarWidth()}px 3px 10px`,
    };
  },
};

// ==========================================
// Public API
// ==========================================
export default hoverable(input(SimpleList, {
  toInternalValue,
  toExternalValue,
  valueAttr: 'id',
}));
