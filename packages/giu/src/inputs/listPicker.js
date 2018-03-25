// @flow

import React from 'react';
import { merge } from 'timm';
import {
  COLORS,
  UNICODE,
  KEYS,
  NULL_STRING,
  IS_IOS,
  getScrollbarWidth,
} from '../gral/constants';
import { cancelEvent, cancelBodyScrolling } from '../gral/helpers';
import { scrollIntoView } from '../gral/visibility';
import type { ScrollIntoViewOptions } from '../gral/visibility';
import {
  isDark,
  flexContainer,
  flexItem,
  inputReset,
  INPUT_DISABLED,
  GLOW,
} from '../gral/styles';
import type {
  Choice,
  KeyboardEventPars,
  KeyboardShortcut,
} from '../gral/types';

const LIST_SEPARATOR_KEY = '__SEPARATOR__';

// ==========================================
// Types
// ==========================================
type PublicProps = {|
  registerOuterRef?: Function,
  items: Array<Choice>,
  lang?: string,
  curValue: string,
  keyDown?: KeyboardEventPars,
  emptyText?: string,
  onChange: (ev: ?SyntheticEvent<*>, value: string) => any,
  onClickItem?: (ev: ?SyntheticEvent<*>, value: string) => any,
  disabled?: boolean,
  fFocused?: boolean,
  fFloating?: boolean,
  style?: Object,
  styleItem?: Object,
  twoStageStyle?: boolean,
  accentColor?: string,
|};

type DefaultProps = {
  emptyText: string,
  accentColor: string,
};

type Props = {
  ...PublicProps,
  ...$Exact<DefaultProps>,
};

type State = {
  hovering: ?string,
};

// ==========================================
// Component
// ==========================================
class ListPicker extends React.PureComponent<Props, State> {
  refOuter: ?Object;
  refItems: Array<?Object>;

  static defaultProps: DefaultProps = {
    emptyText: 'Ø',
    accentColor: COLORS.accent,
  };

  state = {
    hovering: null,
  };

  componentWillReceiveProps(nextProps: Props) {
    const { keyDown } = nextProps;
    if (keyDown && keyDown !== this.props.keyDown) this.doKeyDown(keyDown);
  }

  // For floating pickers, we need to wait until the float update cycle has finished.
  componentDidMount() {
    const fnScroll = () =>
      this.scrollSelectedIntoView({ topAncestor: this.refOuter });
    if (this.props.fFloating) {
      setTimeout(fnScroll);
    } else {
      fnScroll();
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { curValue } = this.props;
    if (curValue != null && curValue !== prevProps.curValue) {
      this.scrollSelectedIntoView();
    }
  }

  // ==========================================
  render() {
    const { style: baseStyle } = this.props;
    return (
      <div
        ref={this.registerOuterRef}
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
    if (
      !items.length ||
      (items.length === 1 && items[0].value === '' && items[0].label === '')
    ) {
      return <div style={style.empty}>{this.props.emptyText}</div>;
    }
    this.refItems = [];
    return items.map(this.renderItem);
  }

  renderItem = (item: Choice, idx: number) => {
    const { value: itemValue, label, disabled: itemDisabled, shortcuts } = item;
    const {
      curValue,
      disabled,
      styleItem,
      twoStageStyle,
      accentColor,
    } = this.props;
    const { hovering } = this.state;
    if (label === LIST_SEPARATOR_KEY) {
      return (
        <div
          key={`separator_${idx}`}
          ref={c => {
            this.refItems[idx] = c;
          }}
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
      disabled: itemDisabled,
      twoStageStyle,
      accentColor,
    };
    const keyEl = IS_IOS ? undefined : this.renderKeys(shortcuts);
    const finalLabel =
      (typeof label === 'function' ? label(this.props.lang) : label) ||
      UNICODE.nbsp;
    const finalDisabled = disabled || itemDisabled;
    const finalStyle = merge(style.item(styleProps), styleItem);
    return (
      <div
        key={itemValue}
        ref={c => {
          this.refItems[idx] = c;
        }}
        id={itemValue}
        onMouseEnter={finalDisabled ? undefined : this.onHoverStart}
        onMouseLeave={finalDisabled ? undefined : this.onHoverStop}
        onMouseDown={cancelEvent}
        onMouseUp={IS_IOS || finalDisabled ? undefined : this.onClickItem}
        onClick={IS_IOS && !finalDisabled ? this.onClickItem : undefined}
        style={finalStyle}
      >
        {finalLabel}
        {keyEl ? <div style={flexItem(1)} /> : undefined}
        {keyEl}
      </div>
    );
  };

  renderKeys(shortcuts: ?Array<KeyboardShortcut>) {
    if (!shortcuts) return null;
    const desc = shortcuts.map(o => o.description).join(', ');
    if (!desc) return null;
    return <span style={style.shortcut}>{desc}</span>;
  }

  // ==========================================
  registerOuterRef = (c: ?Object) => {
    this.refOuter = c;
    this.props.registerOuterRef && this.props.registerOuterRef(c);
  };

  onClickItem = (ev: SyntheticEvent<*>) => {
    const { onClickItem, onChange } = this.props;
    const currentTarget: any = ev.currentTarget;
    const { id } = currentTarget;
    onChange(ev, id);
    if (onClickItem) onClickItem(ev, id);
  };

  onHoverStart = (ev: SyntheticMouseEvent<*>) => {
    this.setState({ hovering: ev.currentTarget.id });
  };

  onHoverStop = () => {
    this.setState({ hovering: null });
  };

  // ==========================================
  doKeyDown({ which, shiftKey, ctrlKey, altKey, metaKey }: KeyboardEventPars) {
    if (shiftKey || ctrlKey || altKey || metaKey) return;
    let idx;
    switch (which) {
      case KEYS.down:
        this.selectMoveBy(+1);
        break;
      case KEYS.up:
        this.selectMoveBy(-1);
        break;
      case KEYS.home:
        this.selectMoveBy(+1, -1);
        break;
      case KEYS.end:
        this.selectMoveBy(-1, this.props.items.length);
        break;
      case KEYS.return: {
        const { onClickItem } = this.props;
        if (onClickItem) {
          idx = this.getCurIdx();
          if (idx >= 0) onClickItem(null, this.props.items[idx].value);
        }
        break;
      }
      case KEYS.del:
      case KEYS.backspace:
        this.props.onChange(null, NULL_STRING);
        break;
      default:
        break;
    }
  }

  selectMoveBy(delta: number, idx0?: number) {
    const { items } = this.props;
    const len = items.length;
    let idx = idx0 != null ? idx0 : this.getCurIdx();
    if (idx < 0) idx = delta >= 0 ? -1 : len;
    let fFound = false;
    while (!fFound) {
      idx += delta;
      if (idx < 0 || idx > len - 1) break;
      const item = items[idx];
      fFound = item.label !== LIST_SEPARATOR_KEY && !item.disabled;
    }
    if (fFound) this.selectMoveTo(idx);
  }

  selectMoveTo(idx: number) {
    const { items } = this.props;
    if (!items.length) return;
    const nextValue = items[idx].value;
    this.props.onChange(null, nextValue);
  }

  getCurIdx() {
    const { curValue, items } = this.props;
    return items.findIndex(item => item.value === curValue);
  }

  scrollSelectedIntoView(options?: ScrollIntoViewOptions) {
    const idx = this.getCurIdx();
    if (idx < 0) return;
    scrollIntoView(this.refItems[idx], options);
  }
}

// ==========================================
const style = {
  outerBase: inputReset({
    paddingTop: 3,
    paddingBottom: 3,
    maxHeight: 'inherit',
    overflowY: 'auto',
  }),
  outerDisabled: undefined, // yet (prevents Flow error)
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
  item: ({
    hovering,
    fHovered,
    fSelected,
    twoStageStyle,
    accentColor,
    disabled,
  }) => {
    let border;
    let backgroundColor;
    if (twoStageStyle) {
      border = `1px solid ${
        fHovered || fSelected ? accentColor : 'transparent'
      }`;
      backgroundColor = fSelected ? accentColor : undefined;
    } else {
      const fHighlighted = fHovered || (fSelected && hovering == null);
      border = '1px solid transparent';
      backgroundColor = fHighlighted ? accentColor : undefined;
    }
    let color;
    if (disabled) {
      color = COLORS.dim;
    } else if (backgroundColor) {
      color = COLORS[isDark(backgroundColor) ? 'lightText' : 'darkText'];
    }
    return flexContainer('row', {
      alignItems: 'center',
      backgroundColor,
      color,
      border,
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
// Public
// ==========================================
export { ListPicker, LIST_SEPARATOR_KEY };
