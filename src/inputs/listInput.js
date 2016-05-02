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
import { scrollIntoView }   from '../gral/visibility';
import { isDark }           from '../gral/styles';
import input                from '../hocs/input';
import hoverable            from '../hocs/hoverable';
import FocusCapture         from '../components/focusCapture';

const NULL_VALUE = '__NULL__';
function toInternalValue(val) { return val != null ? JSON.stringify(val) : NULL_VALUE; }
function toExternalValue(val) { return val !== NULL_VALUE ? JSON.parse(val) : null; }

// ==========================================
// Component
// ==========================================
class ListInput extends React.Component {
  static propTypes = {
    items:                  React.PropTypes.array.isRequired,
    focusable:              React.PropTypes.bool,
    emptyText:              React.PropTypes.string,
    onClickItem:            React.PropTypes.func,
    onKeyDown:              React.PropTypes.func,
    style:                  React.PropTypes.object,
    styleItem:              React.PropTypes.object,
    twoStageStyle:          React.PropTypes.bool,
    accentColor:            React.PropTypes.string,
    // Hoverable HOC
    hovering:               React.PropTypes.any,
    onHoverStart:           React.PropTypes.func.isRequired,
    onHoverStop:            React.PropTypes.func.isRequired,
    // Input HOC
    curValue:               React.PropTypes.string.isRequired,
    registerFocusableRef:   React.PropTypes.func.isRequired,
    onChange:               React.PropTypes.func.isRequired,
    fFocused:               React.PropTypes.bool.isRequired,
    onFocus:                React.PropTypes.func.isRequired,
    onBlur:                 React.PropTypes.func.isRequired,
  };
  static defaultProps = {
    focusable:              true,
    emptyText:              'Ø',
    twoStageStyle:          false,
    accentColor:            COLORS.accent,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    bindAll(this, [
      'registerInputRef',
      'renderItem',
      'onMouseDown',
      'onClickItem',
      'onKeyDown',
      'onFocus',
    ]);
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { style: baseStyle } = this.props;
    return (
      <div ref={c => { this.refList = c; }}
        className="giu-simple-list"
        style={merge(style.outer(this.props), baseStyle)}
        onMouseDown={this.onMouseDown}
      >
        {this.renderFocusCapture()}
        {this.renderContents()}
      </div>
    );
  }

  renderFocusCapture() {
    const { focusable, onBlur } = this.props;
    if (!focusable) return null;
    return (
      <FocusCapture 
        registerRef={this.registerInputRef}
        onFocus={this.onFocus}
        onBlur={onBlur}
        onKeyDown={this.onKeyDown}
      />
    );
  }

  renderContents() {
    const { items } = this.props;
    if (!items.length ||
        (items.length === 1 && items[0].value === '' && items[0].label === '')) {
      return <div style={style.empty}>{this.props.emptyText}</div>;
    }
    return items.map(this.renderItem);
  }

  renderItem(item, idx) {
    const { value: itemValue, label } = item;
    const {
      curValue,
      hovering,
      onHoverStart,
      onHoverStop,
      styleItem,
      twoStageStyle,
      accentColor,
    } = this.props;
    const id = toInternalValue(itemValue);
    const styleProps = {
      hovering,
      fHovered: hovering === id,
      fSelected: curValue === id,
      twoStageStyle,
      accentColor,
    };
    this.refItems = [];
    return (
      <div key={id} ref={c => { this.refItems[idx] = c; }}
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
  registerInputRef(c) {
    this.refInput = c;
    this.props.registerFocusableRef(c);
  }

  onMouseDown(ev) {
    cancelEvent(ev);
    if (this.props.focusable && this.refInput) this.refInput.focus();
  }

  onFocus(ev) {
    scrollIntoView(this.refList);
    this.props.onFocus(ev);
  }

  onClickItem(ev) {
    const { onClickItem, onChange } = this.props;
    onChange(ev);
    if (onClickItem) onClickItem(ev);
  }

  onKeyDown(ev) {
    switch (ev.which) {
      case KEYS.down:   this.selectMoveBy(ev, +1); break;
      case KEYS.up:     this.selectMoveBy(ev, -1); break;
      case KEYS.home:   this.selectMoveTo(ev, 0); break;
      case KEYS.end:    this.selectMoveTo(ev, this.props.items.length - 1); break;
      default:
        if (this.props.onKeyDown) this.props.onKeyDown(ev);
        break;
    }
  }

  selectMoveBy(ev, delta) {
    const { curValue, items } = this.props;
    const len = items.length;
    let idx = items.findIndex(item => toInternalValue(item.value) === curValue);
    if (idx < 0) {
      if (!len) return;
      idx = delta >= 0 ? 0 : len - 1;
    } else {
      idx += delta;
      idx = Math.max(idx, 0);
      idx = Math.min(idx, len - 1);
    }
    this.selectMoveTo(ev, idx);
  }

  selectMoveTo(ev, idx) {
    const { items } = this.props;
    if (!items.length) return;
    cancelEvent(ev);
    const curValue = toInternalValue(items[idx].value);
    this.props.onChange(ev, curValue);
    scrollIntoView(this.refItems[idx]);
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outer: ({ fFocused }) => {
    const out = {
      paddingTop: 3,
      paddingBottom: 3,
      overflowY: 'auto',
      border: `1px solid ${COLORS.line}`,
    };
    if (fFocused) {
      out.boxShadow = COLORS.focusGlow;
      out.border = `1px solid ${COLORS.focus}`;
    }
    return out;
  },
  empty: {
    paddingTop: 3,
    paddingBottom: 3,
    color: COLORS.dim,
    paddingRight: 10 + getScrollbarWidth(),
    paddingLeft: 10,
    cursor: 'not-allowed',
  },
  item: ({ hovering, fHovered, fSelected, twoStageStyle, accentColor }) => {
    let border;
    let backgroundColor;
    if (twoStageStyle) {
      border = `1px solid ${fHovered || fSelected ? accentColor : 'transparent'}`;
      backgroundColor = fSelected ? accentColor : 'transparent';
    } else {
      const fHighlighted = fHovered || (fSelected && hovering == null);
      border = '1px solid transparent';
      backgroundColor = fHighlighted ? accentColor : 'transparent';
    }
    let color;
    if (backgroundColor !== 'transparent') {
      color = COLORS[isDark(backgroundColor) ? 'lightText' : 'darkText'];
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
export default input(hoverable(ListInput), {
  toInternalValue,
  toExternalValue,
  valueAttr: 'id',
});
