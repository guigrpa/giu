// @flow

import React from 'react';
import SelectNative from './selectNative';
import { SelectCustom } from './selectCustom';
import type { SelectProps, SelectPickerType } from './selectTypes';

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
const Select = (props: Props, ref) => {
  const { type } = props;
  const Component = !type || type === 'native' ? SelectNative : SelectCustom;
  return (
    <Component ref={ref} {...props} inlinePicker={type === 'inlinePicker'} />
  );
};

// ==========================================
// Public
// ==========================================
export default React.forwardRef(Select);
