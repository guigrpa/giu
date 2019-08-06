// @flow

import React from 'react';
import { merge } from 'timm';
import classnames from 'classnames';
import {
  KEYS,
  UNICODE,
  NULL_STRING,
  IS_IOS,
  IS_MOBILE_OR_TABLET,
} from '../gral/constants';
import {
  createShortcut,
  registerShortcut,
  unregisterShortcut,
} from '../gral/keys';
import type { Choice, KeyboardEventPars } from '../gral/types';
import { isAncestorNode, memoize } from '../gral/helpers';
import type { Theme } from '../gral/themeContext';
import Input from '../hocs/input';
import type { InputHocPublicProps } from '../hocs/input';
import { ListPicker, LIST_SEPARATOR_KEY } from './listPicker';
import IosFloatWrapper from './iosFloatWrapper';
import { floatAdd, floatDelete, floatUpdate } from '../components/floats';
import Icon from '../components/icon';
import type { SelectProps } from './selectTypes';

const LIST_SEPARATOR = {
  value: LIST_SEPARATOR_KEY,
  label: LIST_SEPARATOR_KEY,
};

const toInternalValue = val =>
  val != null ? JSON.stringify(val) : NULL_STRING;
const toExternalValue = val => {
  if (val === NULL_STRING) return null;
  try {
    return JSON.parse(val);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('SelectCustom: error parsing JSON', val);
    return null;
  }
};
const isNull = val => val === NULL_STRING;

const MANAGE_FOCUS_AUTONOMOUSLY = IS_MOBILE_OR_TABLET;

// ==========================================
// Declarations
// ==========================================
type PublicProps = {
  ...$Exact<InputHocPublicProps>, // common to all inputs (check the docs!)
  ...$Exact<SelectProps>,
  inlinePicker?: boolean,
  id?: string,
};

type Props = {
  ...$Exact<PublicProps>,
  // Input HOC
  theme: Theme,
  curValue: string,
  onChange: Function,
  registerOuterRef: Function,
  fFocused: boolean,
  onFocus: Function,
  onBlur: Function,
};

// ==========================================
// Component
// ==========================================
class BaseSelectCustom extends React.Component<Props> {
  fInit = false;
  prevExtFocused: boolean;
  fFloat = false;
  floatId: ?string;
  items: Array<Choice>;
  refTitle: ?Object;

  refPicker: any = React.createRef();

  componentDidMount() {
    window.addEventListener('click', this.onClickWindow);
    this.registerShortcuts();
  }

  componentWillUnmount() {
    if (this.floatId != null) floatDelete(this.floatId);
    window.removeEventListener('click', this.onClickWindow);
    this.unregisterShortcuts();
  }

  componentDidUpdate() {
    this.renderFloat();
  }

  // ==========================================
  // Imperative API
  // ==========================================
  // Process ESC ourselves; pass down other keystrokes
  doKeyDown(keyDown: KeyboardEventPars) {
    if (keyDown.which === KEYS.esc && !this.props.inlinePicker) {
      this.fFloat = !this.fFloat;
      this.forceUpdate();
    } else {
      const target = this.refPicker.current;
      if (target && target.doKeyDown) target.doKeyDown(keyDown);
    }
  }

  // ==========================================
  prepareRender() {
    this.items = this.prepareItems(this.props.items, this.props.required);

    // Only when props change
    const { fFocused } = this.props;
    if (!this.fInit || fFocused !== this.prevExtFocused) {
      this.prevExtFocused = fFocused;
      this.fFloat = fFocused;
    }
    this.fInit = true;
  }

  // ==========================================
  render() {
    this.prepareRender();
    const { children } = this.props;
    let out;
    if (this.props.inlinePicker) {
      out = this.renderPicker();
    } else if (children) {
      out = this.renderProvidedTitle(children);
    } else {
      out = this.renderDefaultTitle();
    }
    return out;
  }

  renderProvidedTitle(children) {
    const elTitle = React.cloneElement(children, {
      ref: this.registerTitleRef,
      onClick: this.onClickTitle,
    });
    return IS_IOS ? (
      <span className="giu-select-custom-title-wrapper-for-ios">
        {elTitle}
        {this.renderFloatForIos()}
      </span>
    ) : (
      elTitle
    );
  }

  renderDefaultTitle() {
    const { curValue, lang, disabled } = this.props;
    let label = UNICODE.nbsp;
    if (curValue !== NULL_STRING) {
      const item = this.items.find(o => o.value === curValue);
      if (item) {
        label =
          typeof item.label === 'function' ? item.label(lang) : item.label;
      }
    }
    const caretIcon = this.fFloat ? 'caret-up' : 'caret-down';
    return (
      <span
        ref={this.registerTitleRef}
        className={classnames('giu-input-reset giu-select-custom', {
          'giu-glow': this.props.fFocused,
          'giu-input-disabled': disabled,
        })}
        onMouseDown={this.onMouseDownTitle}
        onClick={this.onClickTitle}
      >
        <span className="giu-select-custom-title-text">{label}</span>
        <Icon
          className={classnames('giu-select-custom-caret', {
            'giu-select-custom-caret-disabled': disabled,
          })}
          icon={caretIcon}
          skipTheme
        />
        {IS_IOS && this.renderFloatForIos()}
      </span>
    );
  }

  renderFloat() {
    if (this.props.inlinePicker) return;
    if (IS_IOS) return;
    const { fFloat } = this;

    // Remove float
    if (!fFloat && this.floatId != null) {
      floatDelete(this.floatId);
      this.floatId = null;
      this.props.onCloseFloat && this.props.onCloseFloat();
      return;
    }

    // Create or update float
    if (fFloat) {
      const { floatPosition, floatAlign } = this.props;
      const floatOptions = {
        position: floatPosition,
        align: floatAlign,
        limitSize: true,
        getAnchorNode: () => this.refTitle,
        children: this.renderPicker(),
      };
      if (this.floatId == null) {
        this.floatId = floatAdd(floatOptions);
      } else {
        floatUpdate(this.floatId, floatOptions);
      }
    }
  }

  renderFloatForIos() {
    if (!this.fFloat) return null;
    return (
      <IosFloatWrapper
        floatPosition={this.props.floatPosition}
        floatAlign={this.props.floatAlign}
      >
        {this.renderPicker()}
      </IosFloatWrapper>
    );
  }

  renderPicker() {
    const { inlinePicker, registerOuterRef } = this.props;
    return (
      <ListPicker
        ref={this.refPicker}
        registerOuterRef={inlinePicker ? registerOuterRef : undefined}
        items={this.items}
        lang={this.props.lang}
        curValue={this.props.curValue}
        onChange={this.props.onChange}
        onClickItem={this.onClickItem}
        disabled={this.props.disabled}
        fFocused={inlinePicker && this.props.fFocused}
        fFloating={!inlinePicker}
        twoStageStyle={this.props.twoStageStyle}
        accentColor={this.props.theme.accentColor}
      />
    );
  }

  // ==========================================
  registerTitleRef = c => {
    this.refTitle = c;
    this.props.registerOuterRef(c);
  };

  // If the menu is not focused, ignore it: it will be handled by the `input` HOC.
  // ...but if it is focused, we want to toggle it
  onMouseDownTitle = () => {
    if (!this.props.fFocused) return;
    this.fFloat = !this.fFloat;
    this.forceUpdate();
  };

  // Close the float (if any) but retain the focus
  onClickItem = (ev: ?SyntheticEvent<*>, nextValue: string) => {
    this.fFloat = false;
    this.forceUpdate();
    const { onClickItem } = this.props;
    onClickItem && onClickItem(ev, toExternalValue(nextValue));
  };

  // Only for autonomous focus management
  onClickTitle = (ev: SyntheticEvent<*>) => {
    if (!MANAGE_FOCUS_AUTONOMOUSLY) return;
    if (this.props.fFocused) this.props.onBlur(ev);
    else this.props.onFocus(ev);
  };

  // Only for autonomous focus management
  // Handle click on window (hopefully, they won't swallow it) to blur
  onClickWindow = (ev: SyntheticEvent<*>) => {
    if (!MANAGE_FOCUS_AUTONOMOUSLY) return;
    const { target } = ev;
    // Discard click if it's on our own component (we'll handle it ourselves)
    if (target instanceof Element && isAncestorNode(this.refTitle, target))
      return;
    if (this.props.fFocused) this.props.onBlur(ev);
  };

  // ==========================================
  prepareItems = memoize((rawItems, required) => {
    const items = [];
    if (!required && rawItems.length) {
      items.push({
        value: NULL_STRING,
        label: '',
        shortcuts: [],
      });
    }
    for (let i = 0; i < rawItems.length; i++) {
      const rawItem = rawItems[i];
      const { value } = rawItem;
      if (value === LIST_SEPARATOR_KEY) {
        items.push({
          value: LIST_SEPARATOR_KEY,
          label: LIST_SEPARATOR_KEY,
          shortcuts: [],
        });
        continue;
      }
      let keys = rawItem.keys || [];
      if (!Array.isArray(keys)) keys = [keys];
      const newItem: any = merge(rawItem, {
        value: toInternalValue(value),
        shortcuts: keys.map(createShortcut),
      });
      items.push(newItem);
    }
    return items;
  });

  registerShortcuts() {
    this.items.forEach(item => {
      if (!item.shortcuts) return;
      item.shortcuts.forEach(shortcut => {
        registerShortcut(shortcut, ev => {
          this.props.onChange(ev, item.value);
          this.onClickItem(ev, item.value);
        });
      });
    });
  }

  unregisterShortcuts() {
    this.items.forEach(item => {
      if (item.shortcuts) item.shortcuts.forEach(unregisterShortcut);
    });
  }
}

// ==========================================
const hocOptions = {
  componentName: 'SelectCustom',
  toInternalValue,
  toExternalValue,
  isNull,
  fIncludeFocusCapture: !MANAGE_FOCUS_AUTONOMOUSLY,
  trappedKeys: [
    KEYS.esc,
    // For ListPicker
    KEYS.down,
    KEYS.up,
    KEYS.home,
    KEYS.end,
    KEYS.return,
    KEYS.del,
    KEYS.backspace,
  ],
  className: 'giu-select-custom-wrapper',
};
const render = (props, ref) => <BaseSelectCustom {...props} ref={ref} />;
// $FlowFixMe
const SelectCustom = React.forwardRef((publicProps: PublicProps, ref) => (
  <Input hocOptions={hocOptions} render={render} {...publicProps} ref={ref} />
));

// ==========================================
// Public
// ==========================================
export { SelectCustom, LIST_SEPARATOR };
