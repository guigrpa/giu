// @flow

import React from 'react';
import { omit } from 'timm';
import classnames from 'classnames';
import { NULL_STRING } from '../gral/constants';
import Input, { INPUT_HOC_INVALID_HTML_PROPS } from '../hocs/input';
import type { InputHocPublicProps } from '../hocs/input';
import { LIST_SEPARATOR_KEY } from './listPicker';
import type { SelectProps } from './selectTypes';

const toInternalValue = (val) =>
  val != null ? JSON.stringify(val) : NULL_STRING;
const toExternalValue = (val) => {
  if (val === NULL_STRING) return null;
  try {
    return JSON.parse(val);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('SelectNative: error parsing JSON', val);
    return null;
  }
};
const isNull = (val) => val === NULL_STRING;

// ==========================================
// Declarations
// ==========================================
type PublicProps = {
  ...$Exact<InputHocPublicProps>, // common to all inputs (check the docs!)
  ...$Exact<SelectProps>,
};

type Props = {
  ...$Exact<PublicProps>,
  // Input HOC
  curValue: string,
  registerFocusableRef: Function,
};

// Should include all public props, + 'required', 'style':
const FILTERED_OUT_PROPS = [
  'inlinePicker',
  ...INPUT_HOC_INVALID_HTML_PROPS,
  'className',
  'id',
  'type',
  'items',
  'lang',
  'required',
  'disabled',
  'required',
  'style',
];

// ==========================================
// Component
// ==========================================
class BaseSelectNative extends React.Component<Props> {
  render() {
    const { curValue, items, lang, required, disabled, registerFocusableRef } =
      this.props;
    const finalItems = [];
    if (!required) finalItems.push({ value: NULL_STRING, label: '' });
    items.forEach((option) => {
      if (option.label !== LIST_SEPARATOR_KEY) finalItems.push(option);
    });
    const otherProps = omit(this.props, FILTERED_OUT_PROPS);
    return (
      <select
        ref={registerFocusableRef}
        className={classnames(
          'giu-select-native',
          { 'giu-input-disabled': disabled },
          this.props.className
        )}
        id={this.props.id}
        value={curValue}
        {...otherProps}
        tabIndex={disabled ? -1 : undefined}
      >
        {finalItems.map((o) => {
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
const hocOptions = {
  componentName: 'SelectNative',
  toInternalValue,
  toExternalValue,
  isNull,
  className: 'giu-select-native-wrapper',
};
const render = (props) => <BaseSelectNative {...props} />;
// $FlowFixMe
const SelectNative = React.forwardRef((publicProps: PublicProps, ref) => (
  <Input hocOptions={hocOptions} render={render} {...publicProps} ref={ref} />
));

// ==========================================
// Public
// ==========================================
export default SelectNative;
