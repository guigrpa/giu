import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { merge }            from 'timm';
import {
  COLORS,
  UNICODE,
  KEYS,
  NULL_STRING,
  IS_IOS,
  getScrollbarWidth,
}                           from '../gral/constants';
import {
  bindAll,
  cancelEvent,
  cancelBodyScrolling,
}                           from '../gral/helpers';
import { scrollIntoView }   from '../gral/visibility';
import {
  isDark,
  flexContainer, flexItem,
  inputReset, INPUT_DISABLED,
  GLOW,
}                           from '../gral/styles';
import hoverable            from '../hocs/hoverable';

const LIST_SEPARATOR_KEY = '__SEPARATOR__';

// ==========================================
// Component
// ==========================================
class BaseListPicker extends React.Component {
  static propTypes = {
    registerOuterRef:       React.PropTypes.func,
    items:                  React.PropTypes.array.isRequired,
    curValue:               React.PropTypes.string.isRequired,
    keyDown:                React.PropTypes.object,
    emptyText:              React.PropTypes.string,
    onChange:               React.PropTypes.func.isRequired,
    onClickItem:            React.PropTypes.func,
    disabled:               React.PropTypes.bool,
    fFocused:               React.PropTypes.bool,
    fFloating:              React.PropTypes.bool,
    style:                  React.PropTypes.object,
    styleItem:              React.PropTypes.object,
    twoStageStyle:          React.PropTypes.bool,
    accentColor:            React.PropTypes.string,
    // Hoverable HOC
    hovering:               React.PropTypes.any,
    onHoverStart:           React.PropTypes.func.isRequired,
    onHoverStop:            React.PropTypes.func.isRequired,
  };
  static defaultProps = {
    emptyText:              'Ø',
    accentColor:            COLORS.accent,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    bindAll(this, [
      'registerOuterRef',
      'renderItem',
      'onClickItem',
    ]);
  }

  componentWillReceiveProps(nextProps) {
    const { keyDown } = nextProps;
    if (keyDown && keyDown !== this.props.keyDown) this.doKeyDown(keyDown);
  }

  // For floating pickers, we need to wait until the float update cycle has finished.
  componentDidMount() {
    const fnScroll = () => this.scrollSelectedIntoView({ topAncestor: this.refOuter });
    if (this.props.fFloating) {
      setTimeout(fnScroll);
    } else {
      fnScroll();
    }
  }

  componentDidUpdate(prevProps) {
    const { curValue } = this.props;
    if (curValue != null && curValue !== prevProps.curValue) {
      this.scrollSelectedIntoView();
    }
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const {
      style: baseStyle,
    } = this.props;
    return (
      <div ref={this.registerOuterRef}
        className="giu-list-picker"
        onWheel={cancelBodyScrolling}
        style={merge(style.outer(this.props), baseStyle)}
      >
        {this.renderContents()}
      </div>
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
    const { value: itemValue, label, shortcuts } = item;
    const {
      curValue,
      hovering, onHoverStart, onHoverStop,
      disabled,
      styleItem, twoStageStyle, accentColor,
    } = this.props;
    if (label === LIST_SEPARATOR_KEY) {
      return (
        <div key={`separator_${idx}`} ref={c => { this.refItems[idx] = c; }}
          onMouseEnter={!disabled && onHoverStart}
          onMouseLeave={!disabled && onHoverStop}
          style={style.separatorWrapper}
        >
          <div style={style.separator} />
        </div>
      );
    }
    const styleProps = {
      hovering,
      fHovered: hovering === itemValue,
      fSelected: curValue === itemValue,
      twoStageStyle, accentColor,
    };
    const keyEl = IS_IOS ? undefined : this.renderKeys(shortcuts);
    return (
      <div key={itemValue} ref={c => { this.refItems[idx] = c; }}
        id={itemValue}
        onMouseEnter={disabled ? undefined : onHoverStart}
        onMouseLeave={disabled ? undefined : onHoverStop}
        onMouseDown={cancelEvent}
        onMouseUp={IS_IOS ? undefined : this.onClickItem}
        onClick={IS_IOS ? this.onClickItem : undefined}
        style={merge(style.item(styleProps), styleItem)}
      >
        {label || UNICODE.nbsp}
        {keyEl ? <div style={flexItem(1)} /> : undefined}
        {keyEl}
      </div>
    );
  }

  renderKeys(shortcuts) {
    if (!shortcuts) return null;
    const desc = shortcuts.map(o => o.description).join(', ');
    if (!desc) return null;
    return <span style={style.shortcut}>{desc}</span>;
  }

  // ==========================================
  // Event handlers
  // ==========================================
  registerOuterRef(c) {
    this.refOuter = c;
    this.props.registerOuterRef && this.props.registerOuterRef(c);
  }

  onClickItem(ev) {
    const { onClickItem, onChange } = this.props;
    onChange(ev, ev.currentTarget.id);
    if (onClickItem) onClickItem(ev, ev.currentTarget.id);
  }

  // ==========================================
  // Helpers
  // ==========================================
  doKeyDown({ which, shiftKey, ctrlKey, altKey, metaKey }) {
    if (shiftKey || ctrlKey || altKey || metaKey) return;
    let idx;
    switch (which) {
      case KEYS.down:   this.selectMoveBy(+1); break;
      case KEYS.up:     this.selectMoveBy(-1); break;
      case KEYS.home:   this.selectMoveBy(+1, -1); break;
      case KEYS.end:    this.selectMoveBy(-1, this.props.items.length); break;
      case KEYS.return:
        if (this.props.onClickItem) {
          idx = this.getCurIdx();
          if (idx >= 0) this.props.onClickItem(null, this.props.items[idx].value);
        }
        break;
      case KEYS.del:
      case KEYS.backspace:
        this.props.onChange(null, NULL_STRING);
        break;
      default:
        break;
    }
  }

  selectMoveBy(delta, idx0) {
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
    if (fFound) this.selectMoveTo(idx);
  }

  selectMoveTo(idx) {
    const { items } = this.props;
    if (!items.length) return;
    const nextValue = items[idx].value;
    this.props.onChange(null, nextValue);
  }

  getCurIdx() {
    const { curValue, items } = this.props;
    return items.findIndex(item => item.value === curValue);
  }

  scrollSelectedIntoView(options) {
    const idx = this.getCurIdx();
    if (idx < 0) return;
    scrollIntoView(this.refItems[idx], options);
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outerBase: inputReset({
    paddingTop: 3,
    paddingBottom: 3,
    maxHeight: 'inherit',
    overflowY: 'auto',
  }),
  outer: ({ disabled, fFocused }) => {
    let out = style.outerBase;
    if (disabled) out = merge(out, style.outerDisabled);
    if (fFocused) out = merge(out, GLOW);
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
    return flexContainer('row', {
      alignItems: 'center',
      backgroundColor, color, border,
      cursor: 'default',
      whiteSpace: 'nowrap',
      padding: `3px ${10 + getScrollbarWidth()}px 3px 10px`,
    });
  },
  separatorWrapper: {
    paddingTop: 3,
    paddingBottom: 3,
    height: 7,
    cursor: 'default',
  },
  separator: {
    borderTop: `1px solid ${COLORS.line}`,
    height: 1,
  },
  shortcut: {
    marginLeft: 20,
  },
};
style.outerDisabled = merge(INPUT_DISABLED, {
  pointerEvents: null,
});


// ==========================================
// Public API
// ==========================================
const ListPicker = hoverable(BaseListPicker);

export {
  ListPicker,
  LIST_SEPARATOR_KEY,
};
