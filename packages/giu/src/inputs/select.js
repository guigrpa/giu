// @no-flow

import * as React from 'react';
import SelectNative from '../inputs/selectNative';
import { SelectCustom } from '../inputs/selectCustom';
import type { SelectProps, SelectPickerType } from '../inputs/selectTypes';

// ==========================================
// Component
// ==========================================
type DefaultProps = {
  type: SelectPickerType,
};

type Props = {
  ...$Exact<SelectProps>,
  ...$Exact<DefaultProps>,
};

class Select extends React.Component<Props> {
  static defaultProps: DefaultProps = {
    type: 'native',
  };
  refInput: ?Object;

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
    const Component = type === 'native' ? SelectNative : SelectCustom;
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
// Public API
// ==========================================
export default Select;
