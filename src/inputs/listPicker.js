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

const LIST_SEPARATOR_KEY = '__SEPARATOR__';
const LIST_SEPARATOR = {
  value: LIST_SEPARATOR_KEY,
  label: LIST_SEPARATOR_KEY,
};

// ==========================================
// Component
// ==========================================
class BaseListPicker extends React.Component {
  static propTypes = {
    items:                  React.PropTypes.array.isRequired,
    focusable:              React.PropTypes.bool,
    emptyText:              React.PropTypes.string,
    onClickItem:            React.PropTypes.func,
    onKeyDown:              React.PropTypes.func,
    cmds:                   React.PropTypes.array,
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
    onChange:               React.PropTypes.func.isRequired,
    registerOuterRef:       React.PropTypes.func.isRequired,
    registerFocusableRef:   React.PropTypes.func.isRequired,
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
      'registerOuterRef',
      'registerFocusableRef',
      'renderItem',
      'onMouseDown',
      'onClickItem',
      'onKeyDown',
      'onFocus',
    ]);
  }

  componentDidMount() { this.scrollSelectedIntoView(); }

  componentDidUpdate(prevProps) {
    const { cmds } = this.props;
    if (!cmds) return;
    if (cmds !== prevProps.cmds) {
      for (const cmd of cmds) {
        switch (cmd.type) {
          case 'KEY_DOWN':
            this.doKeyDown(null, cmd.which);
            break;
          default:
            break;
        }
      }
    }
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { style: baseStyle } = this.props;
    return (
      <div ref={this.registerOuterRef}
        className="giu-list-picker"
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
        registerRef={this.registerFocusableRef}
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
    this.refItems = [];
    return items.map(this.renderItem);
  }

  renderItem(item, idx) {
    const { value: itemValue, label } = item;
    if (label === LIST_SEPARATOR_KEY) {
      return (
        <div key={`separator_${idx}`} ref={c => { this.refItems[idx] = c; }}
          style={style.separator}
        />
      );
    }
    const {
      curValue,
      hovering, onHoverStart, onHoverStop,
      styleItem, twoStageStyle, accentColor,
    } = this.props;
    const id = toInternalValue(itemValue);
    const styleProps = {
      hovering,
      fHovered: hovering === id,
      fSelected: curValue === id,
      twoStageStyle, accentColor,
    };
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
  registerOuterRef(c) {
    this.refOuter = c;
    this.props.registerOuterRef(c);
  }

  registerFocusableRef(c) {
    this.refFocus = c;
    this.props.registerFocusableRef(c);
  }

  onMouseDown(ev) {
    cancelEvent(ev);
    if (this.props.focusable && this.refFocus) this.refFocus.focus();
  }

  onFocus(ev) {
    scrollIntoView(this.refOuter);
    this.props.onFocus(ev);
  }

  onClickItem(ev) {
    const { onClickItem, onChange } = this.props;
    onChange(ev);
    if (onClickItem) onClickItem(ev, toExternalValue(ev.target.id));
  }

  onKeyDown(ev) { this.doKeyDown(ev, ev.which); }
  doKeyDown(ev, which) {
    let idx;
    switch (which) {
      case KEYS.down:   this.selectMoveBy(ev, +1); break;
      case KEYS.up:     this.selectMoveBy(ev, -1); break;
      case KEYS.home:   this.selectMoveBy(ev, +1, -1); break;
      case KEYS.end:    this.selectMoveBy(ev, -1, this.props.items.length); break;
      case KEYS.return:
        if (this.props.onClickItem) {
          idx = this.getCurIdx();
          if (idx >= 0) this.props.onClickItem(ev, toExternalValue(this.props.items[idx].value));
        }
        break;
      case KEYS.del:
      case KEYS.backspace:
        this.props.onChange(null, NULL_VALUE);
        break;
      default:
        if (this.props.onKeyDown) this.props.onKeyDown(ev);
        break;
    }
  }

  // ==========================================
  // Helpers
  // ==========================================
  selectMoveBy(ev, delta, idx0) {
    const { items } = this.props;
    const len = items.length;
    let idx = idx0 != null ? idx0 : this.getCurIdx();
    if (idx < 0) idx = delta >= 0 ? -1 : len;
    let fFound = false;
    while (!fFound) {
      idx += delta;
      if (idx < 0 || idx > len - 1) break;
      fFound = (items[idx].label !== LIST_SEPARATOR_KEY);
    }
    if (fFound) this.selectMoveTo(ev, idx);
  }

  selectMoveTo(ev, idx) {
    const { items } = this.props;
    if (!items.length) return;
    cancelEvent(ev);
    const curValue = toInternalValue(items[idx].value);
    this.props.onChange(ev, curValue);
    scrollIntoView(this.refItems[idx]);
  }

  getCurIdx() {
    const { curValue, items } = this.props;
    return items.findIndex(item => toInternalValue(item.value) === curValue);
  }

  scrollSelectedIntoView() {
    const idx = this.getCurIdx();
    if (idx < 0) return;
    scrollIntoView(this.refItems[idx], { topAncestor: this.refOuter });
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
      backgroundColor = fSelected ? accentColor : undefined;
    } else {
      const fHighlighted = fHovered || (fSelected && hovering == null);
      border = '1px solid transparent';
      backgroundColor = fHighlighted ? accentColor : undefined;
    }
    let color;
    if (backgroundColor) {
      color = COLORS[isDark(backgroundColor) ? 'lightText' : 'darkText'];
    }
    return {
      backgroundColor, color, border,
      cursor: 'default',
      whiteSpace: 'nowrap',
      padding: `3px ${10 + getScrollbarWidth()}px 3px 10px`,
    };
  },
  separator: {
    borderTop: `1px solid ${COLORS.line}`,
    height: 1,
    marginTop: 3,
    marginBottom: 3,
    cursor: 'default',
  },
};

// ==========================================
// Public API
// ==========================================
const ListPicker = input(hoverable(BaseListPicker), {
  toInternalValue,
  toExternalValue,
  valueAttr: 'id',
});

export {
  ListPicker,
  LIST_SEPARATOR,
};
