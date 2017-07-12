// @flow

import React from 'react';
import { omit } from 'timm';
import input, { INPUT_HOC_INVALID_HTML_PROPS } from '../hocs/input';

const toInternalValue = val => (val != null ? val : false);
const toExternalValue = val => val;
const isNull = val => val == null;

let cntId = 0;

// ==========================================
// Types
// ==========================================
// -- Props:
// -- START_DOCS
type PublicProps = {
  id?: string,
  label?: any, // React components to be included in the checkbox's `label` element
  disabled?: boolean,
  styleLabel?: Object, // merged with the `label` style
  // all others are passed through to the `input` unchanged
};
// -- END_DOCS

const FILTERED_OUT_PROPS = [
  'id',
  'label',
  'disabled',
  'styleLabel',
  ...INPUT_HOC_INVALID_HTML_PROPS,
];

type Props = {
  ...$Exact<PublicProps>,
  // Input HOC
  curValue: boolean,
  registerOuterRef: Function,
  registerFocusableRef: Function,
};

// ==========================================
// Component
// ==========================================
class Checkbox extends React.Component {
  static defaultProps = {};
  props: Props;
  labelId: string;

  constructor(props: Props) {
    super(props);
    this.labelId = this.props.id || `giu-checkbox_${cntId}`;
    cntId += 1;
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    return this.props.label
      ? this.renderWithLabel()
      : this.renderInput('giu-checkbox');
  }

  renderWithLabel() {
    const { label, registerOuterRef, styleLabel } = this.props;
    return (
      <span
        ref={registerOuterRef}
        className="giu-checkbox"
        style={style.wrapper}
      >
        {this.renderInput()}
        <label htmlFor={this.labelId} style={styleLabel}>{label}</label>
      </span>
    );
  }

  renderInput(className?: string) {
    const { curValue, disabled, registerFocusableRef } = this.props;
    const inputProps = omit(this.props, FILTERED_OUT_PROPS);
    return (
      <input
        ref={registerFocusableRef}
        id={this.labelId}
        className={className}
        type="checkbox"
        checked={curValue}
        tabIndex={disabled ? -1 : undefined}
        {...inputProps}
        disabled={disabled}
      />
    );
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  wrapper: {
    whiteSpace: 'nowrap',
  },
};

// ==========================================
// Public API
// ==========================================
export default input(Checkbox, {
  toInternalValue,
  toExternalValue,
  isNull,
  valueAttr: 'checked',
});
