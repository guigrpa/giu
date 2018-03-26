// @flow

import React from 'react';
import SelectNative from '../inputs/selectNative';
import { SelectCustom } from '../inputs/selectCustom';
import type { SelectProps, SelectPickerType } from '../inputs/selectTypes';

// ==========================================
// Declarations
// ==========================================
type Props = {
  ...$Exact<SelectProps>,
  type?: SelectPickerType,
};

// ==========================================
// Component
// ==========================================
class Select extends React.Component<Props> {
  refInput: ?Object;

  static defaultProps = {};

  // ==========================================
  // Forward imperative interface
  // ==========================================
  getValue() {
    return this.refInput ? this.refInput.getValue() : null;
  }
  getErrors() {
    return this.refInput ? this.refInput.getErrors() : null;
  }
  validateAndGetValue() {
    return this.refInput ? this.refInput.validateAndGetValue() : null;
  }

  // ==========================================
  render() {
    const { type } = this.props;
    const Component = !type || type === 'native' ? SelectNative : SelectCustom;
    return (
      <Component
        ref={this.registerInputRef}
        {...this.props}
        inlinePicker={type === 'inlinePicker'}
      />
    );
  }

  // ==========================================
  registerInputRef = (c: ?Object) => {
    this.refInput = c;
  };
}

// ==========================================
// Public
// ==========================================
export default Select;
