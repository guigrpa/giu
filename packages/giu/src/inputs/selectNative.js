// @flow

import React from 'react';
import { omit, merge } from 'timm';
import { NULL_STRING } from '../gral/constants';
import { inputReset, INPUT_DISABLED } from '../gral/styles';
import input, { INPUT_HOC_INVALID_HTML_PROPS } from '../hocs/input';
import { LIST_SEPARATOR_KEY } from '../inputs/listPicker';
import type { SelectProps } from './selectTypes';

const toInternalValue = val =>
  val != null ? JSON.stringify(val) : NULL_STRING;
const toExternalValue = val => {
  if (val === NULL_STRING) return null;
  try {
    return JSON.parse(val);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('SelectNative: error parsing JSON', val);
    return null;
  }
};
const isNull = val => val === NULL_STRING;

// ==========================================
// Declarations
// ==========================================
type Props = {
  ...$Exact<SelectProps>,
  // Input HOC
  curValue: string,
  registerFocusableRef: Function,
};

const FILTERED_OUT_PROPS = [
  'inlinePicker',
  'items',
  'lang',
  'required',
  'disabled',
  'style',
  ...INPUT_HOC_INVALID_HTML_PROPS,
];

// ==========================================
// Component
// ==========================================
class SelectNative extends React.Component<Props> {
  static defaultProps = {};

  // ==========================================
  render() {
    const {
      curValue,
      items,
      lang,
      required,
      disabled,
      registerFocusableRef,
    } = this.props;
    const finalItems = [];
    if (!required) finalItems.push({ value: NULL_STRING, label: '' });
    items.forEach(option => {
      if (option.label !== LIST_SEPARATOR_KEY) finalItems.push(option);
    });
    const otherProps = omit(this.props, FILTERED_OUT_PROPS);
    return (
      <select
        ref={registerFocusableRef}
        className="giu-select-native"
        value={curValue}
        {...otherProps}
        tabIndex={disabled ? -1 : undefined}
        style={style.field(this.props)}
      >
        {finalItems.map(o => {
          const value =
            o.value === NULL_STRING ? o.value : toInternalValue(o.value);
          const label = typeof o.label === 'function' ? o.label(lang) : o.label;
          return (
            <option key={value} id={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    );
  }
}

// ==========================================
const style = {
  fieldBase: inputReset({
    backgroundColor: 'default',
    border: 'default',
  }),
  field: ({ disabled, style: base }) => {
    let out = style.fieldBase;
    if (disabled) out = merge(out, INPUT_DISABLED);
    out = merge(out, base);
    return out;
  },
};

// ==========================================
// Public
// ==========================================
export default input(SelectNative, {
  toInternalValue,
  toExternalValue,
  isNull,
});
