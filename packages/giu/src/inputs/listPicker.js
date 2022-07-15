// @flow

import React from 'react';
import classnames from 'classnames';
import { UNICODE, KEYS, NULL_STRING, IS_IOS } from '../gral/constants';
import { cancelEvent, cancelBodyScrolling } from '../gral/helpers';
import { scrollIntoView } from '../gral/visibility';
import type { ScrollIntoViewOptions } from '../gral/visibility';
import type {
  Choice,
  KeyboardEventPars,
  KeyboardShortcut,
} from '../gral/types';

const LIST_SEPARATOR_KEY = '__SEPARATOR__';
const DEFAULT_EMPTY_TEXT = 'Ø';

// ==========================================
// Declarations
// ==========================================
type Props = {|
  className?: string,
  id?: string,
  registerOuterRef?: Function,
  items: Array<Choice>,
  lang?: string,
  curValue: string,
  emptyText?: string,
  onChange: (ev: ?SyntheticEvent<*>, value: string) => any,
  onClickItem?: (ev: ?SyntheticEvent<*>, value: string) => any,
  disabled?: boolean,
  fFocused?: boolean,
  fFloating?: boolean,
  twoStageStyle?: boolean,
|};

type State = {};

// ==========================================
// Component
// ==========================================
class ListPicker extends React.PureComponent<Props, State> {
  refOuter: ?Object;
  refItems: Array<?Object>;

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
  // Imperative API
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

  // ==========================================
  render() {
    return (
      <div
        ref={this.registerOuterRef}
        className={classnames(
          'giu-input-reset giu-list-picker',
          {
            'giu-input-disabled': this.props.disabled,
            'giu-glow': this.props.fFocused,
            'giu-list-picker-two-stage': this.props.twoStageStyle,
          },
          this.props.className
        )}
        id={this.props.id}
        onWheel={cancelBodyScrolling}
      >
        {this.renderContents()}
      </div>
    );
  }

  renderContents(): * {
    const { items } = this.props;
    if (
      !items.length ||
      (items.length === 1 && items[0].value === '' && items[0].label === '')
    ) {
      const { emptyText = DEFAULT_EMPTY_TEXT } = this.props;
      return <div className="giu-list-picker-empty">{emptyText}</div>;
    }
    this.refItems = [];
    return items.map(this.renderItem);
  }

  renderItem = (item: Choice, idx: number) => {
    const { value: itemValue, label, disabled: itemDisabled, shortcuts } = item;
    if (label === LIST_SEPARATOR_KEY) return this.renderSeparator(idx);
    const { curValue, disabled } = this.props;
    const keyEl = IS_IOS ? undefined : this.renderKeys(shortcuts);
    const finalLabel =
      (typeof label === 'function' ? label(this.props.lang) : label) ||
      UNICODE.nbsp;
    const finalDisabled = disabled || itemDisabled;
    return (
      <div
        key={itemValue}
        ref={(c) => {
          this.refItems[idx] = c;
        }}
        id={itemValue}
        className={classnames('giu-list-item', {
          'giu-list-item-selected': curValue === itemValue,
          'giu-list-item-disabled': itemDisabled,
        })}
        onMouseDown={cancelEvent}
        onMouseUp={IS_IOS || finalDisabled ? undefined : this.onClickItem}
        onClick={IS_IOS && !finalDisabled ? this.onClickItem : undefined}
      >
        {finalLabel}
        {keyEl ? <div className="giu-flex-space" /> : undefined}
        {keyEl}
      </div>
    );
  };

  renderSeparator(idx: number) {
    return (
      <div
        key={`separator_${idx}`}
        ref={(c) => {
          this.refItems[idx] = c;
        }}
        className="giu-list-separator-wrapper"
      >
        <div className="giu-list-separator" />
      </div>
    );
  }

  renderKeys(shortcuts: ?Array<KeyboardShortcut>) {
    if (!shortcuts) return null;
    const desc = shortcuts.map((o) => o.description).join(', ');
    if (!desc) return null;
    return <span className="giu-list-item-shortcut">{desc}</span>;
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

  // ==========================================
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
    return items.findIndex((item) => item.value === curValue);
  }

  scrollSelectedIntoView(options?: ScrollIntoViewOptions) {
    const idx = this.getCurIdx();
    if (idx < 0) return;
    scrollIntoView(this.refItems[idx], options);
  }
}

// ==========================================
// Public
// ==========================================
export { ListPicker, LIST_SEPARATOR_KEY };
